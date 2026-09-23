import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Animal,
  Barn,
  CareTask,
  InventoryItem,
  HealthLog,
  UserProfile,
  ProductionStat,
} from '../types/farm';
import {
  INITIAL_USER,
  INITIAL_ANIMALS,
  INITIAL_BARNS,
  INITIAL_TASKS,
  INITIAL_INVENTORY,
  INITIAL_HEALTH_LOGS,
  INITIAL_PRODUCTION_STATS,
} from '../data/mockData';

interface FarmContextType {
  user: UserProfile | null;
  login: (userData: UserProfile) => void;
  logout: () => void;
  updateUser: (profile: Partial<UserProfile>) => void;

  animals: Animal[];
  addAnimal: (animal: Omit<Animal, 'id'>) => void;
  updateAnimal: (id: string, animal: Partial<Animal>) => void;
  deleteAnimal: (id: string) => void;

  barns: Barn[];
  addBarn: (barn: Omit<Barn, 'id'>) => void;
  updateBarn: (id: string, barn: Partial<Barn>) => void;
  deleteBarn: (id: string) => void;
  toggleBarnVentilation: (id: string) => void;
  sanitizeBarn: (id: string) => void;

  tasks: CareTask[];
  addTask: (task: Omit<CareTask, 'id'>) => void;
  updateTask: (id: string, task: Partial<CareTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  addBatchTasks: (tasks: Omit<CareTask, 'id'>[]) => void;

  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  adjustInventoryStock: (id: string, amount: number) => void;

  healthLogs: HealthLog[];
  addHealthLog: (log: Omit<HealthLog, 'id'>) => void;
  updateHealthLog: (id: string, log: Partial<HealthLog>) => void;

  productionStats: ProductionStat[];

  activeTab: string;
  setActiveTab: (tab: string) => void;

  aiPromptPrefill: string;
  setAiPromptPrefill: (prompt: string) => void;

  quickDiagnoseAnimal: (animal: Animal) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('farmpro_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [animals, setAnimals] = useState<Animal[]>(() => {
    const saved = localStorage.getItem('farmpro_animals');
    return saved ? JSON.parse(saved) : INITIAL_ANIMALS;
  });

  const [barns, setBarns] = useState<Barn[]>(() => {
    const saved = localStorage.getItem('farmpro_barns');
    return saved ? JSON.parse(saved) : INITIAL_BARNS;
  });

  const [tasks, setTasks] = useState<CareTask[]>(() => {
    const saved = localStorage.getItem('farmpro_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('farmpro_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [healthLogs, setHealthLogs] = useState<HealthLog[]>(() => {
    const saved = localStorage.getItem('farmpro_health_logs');
    return saved ? JSON.parse(saved) : INITIAL_HEALTH_LOGS;
  });

  const [productionStats] = useState<ProductionStat[]>(INITIAL_PRODUCTION_STATS);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [aiPromptPrefill, setAiPromptPrefill] = useState<string>('');

  // Local storage synchronization
  useEffect(() => {
    if (user) {
      localStorage.setItem('farmpro_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('farmpro_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('farmpro_animals', JSON.stringify(animals));
  }, [animals]);

  useEffect(() => {
    localStorage.setItem('farmpro_barns', JSON.stringify(barns));
  }, [barns]);

  useEffect(() => {
    localStorage.setItem('farmpro_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('farmpro_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('farmpro_health_logs', JSON.stringify(healthLogs));
  }, [healthLogs]);

  // Auth methods
  const login = (userData: UserProfile) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (profile: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...profile } : null));
  };

  // Animal methods
  const addAnimal = (animalData: Omit<Animal, 'id'>) => {
    const newAnimal: Animal = {
      ...animalData,
      id: `an-${Date.now()}`,
    };
    setAnimals((prev) => [newAnimal, ...prev]);

    // Update barn count
    if (animalData.barnId) {
      setBarns((prev) =>
        prev.map((b) => (b.id === animalData.barnId ? { ...b, currentCount: b.currentCount + 1 } : b))
      );
    }
  };

  const updateAnimal = (id: string, updatedFields: Partial<Animal>) => {
    setAnimals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
  };

  const deleteAnimal = (id: string) => {
    const animalToDelete = animals.find((a) => a.id === id);
    setAnimals((prev) => prev.filter((a) => a.id !== id));

    if (animalToDelete && animalToDelete.barnId) {
      setBarns((prev) =>
        prev.map((b) =>
          b.id === animalToDelete.barnId
            ? { ...b, currentCount: Math.max(0, b.currentCount - 1) }
            : b
        )
      );
    }
  };

  // Barn methods
  const addBarn = (barnData: Omit<Barn, 'id'>) => {
    const newBarn: Barn = {
      ...barnData,
      id: `barn-${Date.now()}`,
    };
    setBarns((prev) => [...prev, newBarn]);
  };

  const updateBarn = (id: string, fields: Partial<Barn>) => {
    setBarns((prev) => prev.map((b) => (b.id === id ? { ...b, ...fields } : b)));
  };

  const deleteBarn = (id: string) => {
    setBarns((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleBarnVentilation = (id: string) => {
    setBarns((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ventilationOn: !b.ventilationOn } : b))
    );
  };

  const sanitizeBarn = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setBarns((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, cleanliness: 'Tốt', lastSanitized: today }
          : b
      )
    );
  };

  // Task methods
  const addTask = (taskData: Omit<CareTask, 'id'>) => {
    const newTask: CareTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (id: string, fields: Partial<CareTask>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
          : t
      )
    );
  };

  const addBatchTasks = (newTasksData: Omit<CareTask, 'id'>[]) => {
    const timestamp = Date.now();
    const createdTasks: CareTask[] = newTasksData.map((taskData, idx) => ({
      ...taskData,
      id: `task-${timestamp}-${idx}`,
    }));
    setTasks((prev) => [...createdTasks, ...prev]);
  };

  // Inventory methods
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
    };
    setInventory((prev) => [...prev, newItem]);
  };

  const updateInventoryItem = (id: string, fields: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...fields } : i)));
  };

  const adjustInventoryStock = (id: string, amount: number) => {
    setInventory((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity: Math.max(0, i.quantity + amount) } : i
      )
    );
  };

  // Health logs
  const addHealthLog = (logData: Omit<HealthLog, 'id'>) => {
    const newLog: HealthLog = {
      ...logData,
      id: `hl-${Date.now()}`,
    };
    setHealthLogs((prev) => [newLog, ...prev]);

    // Also update animal status if marked
    if (logData.status === 'Chuyển cách ly') {
      updateAnimal(logData.animalId, { status: 'isolated' });
    } else if (logData.status === 'Đang điều trị') {
      updateAnimal(logData.animalId, { status: 'sick' });
    } else if (logData.status === 'Đã khỏi') {
      updateAnimal(logData.animalId, { status: 'healthy' });
    }
  };

  const updateHealthLog = (id: string, fields: Partial<HealthLog>) => {
    setHealthLogs((prev) => prev.map((l) => (l.id === id ? { ...l, ...fields } : l)));
  };

  // Quick jump to AI with animal preloaded
  const quickDiagnoseAnimal = (animal: Animal) => {
    const prompt = `Tôi cần bác sĩ thú y AI chẩn đoán và tư vấn cho vật nuôi sau:
- Mã thẻ tai: ${animal.tagId}
- Tên/Giống: ${animal.name} (${animal.breed})
- Loài: ${animal.species}
- Trọng lượng: ${animal.weightKg} kg
- Tình trạng hiện tại: ${animal.status === 'sick' ? 'Đang bị bệnh' : animal.status === 'monitoring' ? 'Đang theo dõi sức khỏe' : animal.status === 'isolated' ? 'Đã cách ly' : animal.status}
- Ghi chú triệu chứng: "${animal.notes || 'Không có ghi chú'}"

Xin hãy đưa ra chẩn đoán nguyên nhân, phác đồ điều trị ban đầu và lịch trình theo dõi an toàn sinh học.`;

    setAiPromptPrefill(prompt);
    setActiveTab('ai-advisor');
  };

  return (
    <FarmContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        animals,
        addAnimal,
        updateAnimal,
        deleteAnimal,
        barns,
        addBarn,
        updateBarn,
        deleteBarn,
        toggleBarnVentilation,
        sanitizeBarn,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        addBatchTasks,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        adjustInventoryStock,
        healthLogs,
        addHealthLog,
        updateHealthLog,
        productionStats,
        activeTab,
        setActiveTab,
        aiPromptPrefill,
        setAiPromptPrefill,
        quickDiagnoseAnimal,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
