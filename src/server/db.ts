import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';
import { PRODUCT_CATALOG, FarmProduct } from './multiAgentSystem.ts';

dotenv.config();

let pool: Pool | null = null;
let isConnected = false;
let connectionAttempted = false;
let lastError: string | null = null;

// Initialize MySQL pool if host is configured
export async function getDbPool(): Promise<Pool | null> {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const database = process.env.MYSQL_DATABASE || 'farmpro_db';

  if (!host || !user) {
    if (!connectionAttempted) {
      console.log('ℹ️ [MySQL] Chưa cấu hình MYSQL_HOST / MYSQL_USER. Sử dụng chế độ bộ nhớ đệm (In-memory Fallback).');
      connectionAttempted = true;
    }
    return null;
  }

  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 3000,
    });

    // Test ping with fast timeout
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    isConnected = true;
    lastError = null;
    console.log(`✅ [MySQL] Đã kết nối thành công tới cơ sở dữ liệu: ${database} (${host})`);
    return pool;
  } catch (err: any) {
    isConnected = false;
    lastError = err?.message || 'Không thể kết nối máy chủ MySQL';
    console.warn(`⚠️ [MySQL] Không thể kết nối tới ${host}: ${lastError}. Đang sử dụng chế độ In-memory Fallback.`);
    pool = null;
    return null;
  }
}

// Check database connection status for health check & UI status
export async function checkDbConnection(): Promise<{
  connected: boolean;
  host: string;
  database: string;
  mode: 'mysql_live' | 'in_memory_simulation';
  message: string;
}> {
  const host = process.env.MYSQL_HOST || 'localhost';
  const database = process.env.MYSQL_DATABASE || 'farmpro_db';

  try {
    const activePool = await getDbPool();
    if (activePool && isConnected) {
      return {
        connected: true,
        host,
        database,
        mode: 'mysql_live',
        message: `Đã kết nối thành công với MySQL CSDL: ${database}`,
      };
    }
  } catch (err: any) {
    // Ignore, return fallback status
  }

  return {
    connected: false,
    host,
    database,
    mode: 'in_memory_simulation',
    message: lastError
      ? `Chưa kết nối MySQL (${lastError}). Hệ thống đang chạy ở chế độ In-memory an toàn.`
      : 'Chưa cấu hình thông tin MySQL trong .env. Hệ thống đang chạy ở chế độ In-memory an toàn.',
  };
}

// 1. Fetch Farm Products from MySQL or fallback
export async function fetchAllProducts(): Promise<FarmProduct[]> {
  try {
    const activePool = await getDbPool();
    if (activePool) {
      const [rows] = await activePool.query('SELECT * FROM farm_products ORDER BY price_vnd ASC');
      const list = rows as any[];
      if (list && list.length > 0) {
        return list.map((r) => ({
          id: r.id,
          name: r.name,
          brand: r.brand,
          category: r.category,
          targetSpecies: typeof r.target_species === 'string' ? JSON.parse(r.target_species) : r.target_species,
          priceVnd: Number(r.price_vnd),
          unit: r.unit,
          activeIngredients: r.active_ingredients,
          indications: r.indications,
          dosage: r.dosage,
          withdrawalDays: r.withdrawal_days ? Number(r.withdrawal_days) : 0,
          inStock: Number(r.in_stock),
          keywords: typeof r.keywords === 'string' ? JSON.parse(r.keywords) : r.keywords,
        }));
      }
    }
  } catch (err: any) {
    console.warn('Lỗi đọc bảng farm_products từ MySQL, dùng catalog mặc định:', err.message);
  }

  return PRODUCT_CATALOG;
}
