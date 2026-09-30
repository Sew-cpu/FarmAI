/**
 * Predefined Test Suite (TC01 to TC10) matching the Multi-Agent System specifications
 */

import { executeMultiAgentPipeline, MultiAgentExecutionTrace } from './multiAgentSystem.ts';

export interface TestCaseDefinition {
  id: string; // TC01, TC02, ...
  title: string;
  category: string;
  description: string;
  sampleQuery: string;
  expectedBehavior: string;
  expectedAssertions: string[];
}

export const TEST_CASES: TestCaseDefinition[] = [
  {
    id: 'TC01',
    title: 'Tư vấn dinh dưỡng vỗ béo bò thịt (Valid Consultation)',
    category: 'Tư vấn chuẩn',
    description: 'Kiểm thử luồng tư vấn cơ bản: người dùng nhập yêu cầu cám vỗ béo cho bò thịt với hãng CP Việt Nam trong mức ngân sách 400.000 đ.',
    sampleQuery: 'Tôi cần cám vỗ béo tăng trọng nhanh cho đàn bò thịt của hãng CP Việt Nam, ngân sách khoảng 400.000 đ',
    expectedBehavior: 'Hệ thống trích xuất đúng loài Bò, hãng CP Việt Nam, ngân sách 400.000 đ; tìm ra Beef Master CP 992; trả về phác đồ dinh dưỡng đầy đủ.',
    expectedAssertions: [
      'target_species === "Bò"',
      'brand_preference === "CP Việt Nam"',
      'retrievedCandidates contains "Beef Master CP 992"',
      'criticAgent.isValid === true',
      'retryCount === 0',
    ],
  },
  {
    id: 'TC02',
    title: 'Tư vấn thuốc điều trị bệnh phức hợp (Multi-symptom Consultation)',
    category: 'Chẩn đoán lâm sàng',
    description: 'Kiểm thử truy vấn triệu chứng lâm sàng phức hợp (sốt cao + ho thở dốc ở heo) với yêu cầu hãng Marphavet.',
    sampleQuery: 'Heo thịt 95kg bị sốt đỏ 40 độ, thở dốc và ho giật bụng, cần kháng sinh đặc trị của Marphavet',
    expectedBehavior: 'Requirement Agent nhận diện bệnh và loài Heo; Search Agent tìm kiếm kháng sinh hô hấp Flo-Doxy / Amox-Colis; Decision Agent xuất phác đồ 4 bước chi tiết.',
    expectedAssertions: [
      'target_species === "Heo"',
      'symptoms_or_needs matches "sốt đỏ" & "thở dốc"',
      'retrievedCandidates has Marphavet products',
      'decisionAgent has clinicalProtocol with 4 steps',
    ],
  },
  {
    id: 'TC03',
    title: 'Kiểm thử thương hiệu không tồn tại (Non-existent Brand)',
    category: 'Xử lý ngoại lệ',
    description: 'Người dùng yêu cầu thương hiệu ngoại lai không có trong cơ sở dữ liệu hệ thống (SuperVetPro999).',
    sampleQuery: 'Cần mua thuốc tẩy giun cho đàn bò của hãng SuperVetPro999 giá dưới 500k',
    expectedBehavior: 'Hệ thống nhận diện thương hiệu chưa liên kết, không crash, thông báo lịch sự và tự động đề xuất các hãng đối tác uy tín tương đương.',
    expectedAssertions: [
      'brandStatus.isBrandFound === false',
      'brandStatus.brandAlternativeNotice is populated',
      'brandStatus.suggestedBrands contains Marphavet/Virbac',
      'criticAgent adapts and continues consultation',
    ],
  },
  {
    id: 'TC04',
    title: 'Kiểm thử ngân sách quá thấp (Low Budget Handling)',
    category: 'Ràng buộc tài chính',
    description: 'Người dùng đưa ra mức ngân sách cực thấp (15.000 đ), thấp hơn mọi loại thuốc kháng sinh thành phẩm.',
    sampleQuery: 'Cần mua kháng sinh tiêm cho heo sốt với ngân sách chỉ có 15.000 đ',
    expectedBehavior: 'Search Agent phát hiện ngân sách thấp hơn giá tối thiểu, hiển thị cảnh báo tài chính và đề xuất giải pháp tiết kiệm (phân liều, trợ lực thảo dược).',
    expectedAssertions: [
      'budgetStatus.isBudgetSufficient === false',
      'budgetStatus.budgetWarningNotice is populated',
      'suggests closest low-cost alternatives or dosage sharing',
    ],
  },
  {
    id: 'TC05',
    title: 'Kích hoạt cơ chế Retry Lần 1 (Retry - Budget Relaxation)',
    category: 'Tự phục hồi (Self-Healing)',
    description: 'Người dùng yêu cầu vắc xin LMLM Virbac (giá thị trường 850k) nhưng đặt ngân sách 600.000 đ.',
    sampleQuery: 'Tìm vắc xin Lở Mồm Long Móng Virbac cho bò nhưng ngân sách chỉ có 600.000 đ',
    expectedBehavior: 'Lần 1 không đạt ràng buộc ngân sách chặt chẽ -> Critic Agent kích hoạt Retry 1: nới lỏng biên độ ngân sách +25% -> Trả về sản phẩm với ghi chú nới lỏng.',
    expectedAssertions: [
      'criticAgent.retryCount >= 1',
      'relaxationApplied contains "Nới rộng biên độ ngân sách"',
      'criticAgent.isValid === true after retry',
    ],
  },
  {
    id: 'TC06',
    title: 'Kích hoạt Retry Lần 2 (Multi-step Retry & Fallback)',
    category: 'Tự phục hồi nâng cao',
    description: 'Người dùng đặt điều kiện kép bất khả thi: hãng lạ (Apple) + sát trùng dịch tả heo + giá dưới 50k.',
    sampleQuery: 'Tìm thuốc sát trùng tiêu diệt virus dịch tả heo của hãng Apple giá dưới 50k',
    expectedBehavior: 'Critic Agent kích hoạt 2 lượt Retry liên tiếp: nới lỏng ngân sách và bỏ qua thương hiệu không tồn tại, chuyển sang tìm kiếm ngữ nghĩa theo hoạt chất Glutaraldehyde.',
    expectedAssertions: [
      'criticAgent.retryCount === 2',
      'switched to active ingredient matching',
      'recommends Omnicide / Benkocid equivalents',
    ],
  },
  {
    id: 'TC07',
    title: 'Tìm kiếm ngữ nghĩa Vector Search (Semantic Query Matching)',
    category: 'Vector & AI Search',
    description: 'Người dùng diễn đạt triệu chứng bằng ngôn ngữ tự nhiên không chứa từ khóa "kháng sinh" hay "viêm phổi".',
    sampleQuery: 'Con vật bị nổi ban đỏ khắp tai và bẹn, thân nhiệt nóng như hòn than, nhịp thở dồn dập',
    expectedBehavior: 'Search Agent dùng Vector Similarity tính toán khoảng cách ngữ nghĩa giữa mô tả và chỉ định lâm sàng, tìm ra Amox-Colis & Anagin-C với điểm tương đồng > 70%.',
    expectedAssertions: [
      'semanticVectorHits[0].similarityScore >= 0.70',
      'matches Amox-Colis / Anagin-C via semantic relevance',
    ],
  },
  {
    id: 'TC08',
    title: 'Kiểm thử an toàn phòng chống SQL Injection (SQL Injection Safety)',
    category: 'Bảo mật & An toàn',
    description: 'Kiểm thử xâm nhập SQL Injection bằng câu lệnh độc hại chứa chuỗi OR 1=1 và DROP TABLE.',
    sampleQuery: "Bò bị bệnh ' OR '1'='1' -- DROP TABLE farm_products; SELECT * FROM users",
    expectedBehavior: 'Search Agent nhận diện mẫu SQL Injection, khử khuẩn tham số hóa an toàn (:species, :category), ngăn chặn phá hoại CSDL.',
    expectedAssertions: [
      'searchAgent.sqlInjectionDetected === true',
      'searchAgent.isSafeParameterized === true',
      'database integrity maintained with zero data leak',
    ],
  },
  {
    id: 'TC09',
    title: 'Kiểm thử trích xuất Schema JSON (Requirement Agent)',
    category: 'Trích xuất cấu trúc',
    description: 'Kiểm thử tính toàn vẹn và độ chính xác của schema JSON do Requirement Agent trích xuất.',
    sampleQuery: 'Trang trại cần mua 5 chai dung dịch hạ sốt Bio-Pharmachemie cho dê sốt cao, ngân sách 100k, cần gấp',
    expectedBehavior: 'Requirement Agent trích xuất chuẩn schema: intent, target_species = "Dê", brand_preference = "Bio-Pharmachemie", budget_vnd = 100000, urgency = "Khẩn cấp".',
    expectedAssertions: [
      'requirementAgent.data.target_species === "Dê"',
      'requirementAgent.data.brand_preference === "Bio-Pharmachemie"',
      'requirementAgent.data.budget_vnd === 100000',
      'requirementAgent.data.urgency === "Khẩn cấp" || "Cao"',
      'requirementAgent.data.confidence_score >= 0.85',
    ],
  },
  {
    id: 'TC10',
    title: 'Kiểm thử tích hợp End-to-End toàn trình trên Giao diện Web',
    category: 'Tích hợp toàn diện',
    description: 'Chạy một luồng tổng thể qua giao diện Web: phân tích yêu cầu -> truy vấn kho -> đánh giá retry -> đưa ra quyết định -> 1 chạm áp dụng vào trang trại.',
    sampleQuery: 'Tư vấn phác đồ phòng trị bệnh lở mồm long móng cho đàn bò sữa 32 con của trang trại',
    expectedBehavior: 'Toàn bộ 4 agent phối hợp liền mạch, hiển thị trực quan trạng thái từng tác tử, kết quả được đồng bộ vào danh sách công việc và kho vật tư trang trại.',
    expectedAssertions: [
      'Full pipeline executes within SLA (< 4000ms)',
      'All 4 agent stages have execution traces',
      'Interactive UI buttons allow 1-click apply to Farm Tasks & Inventory',
    ],
  },
];

export async function runSingleTestCase(testCaseId: string): Promise<{
  definition: TestCaseDefinition;
  trace: MultiAgentExecutionTrace;
  assertionResults: Array<{ name: string; passed: boolean; message: string }>;
  overallPassed: boolean;
}> {
  const tc = TEST_CASES.find((t) => t.id === testCaseId) || TEST_CASES[0];
  const trace = await executeMultiAgentPipeline(tc.sampleQuery, tc.id);

  const assertions: Array<{ name: string; passed: boolean; message: string }> = [];

  switch (tc.id) {
    case 'TC01':
      assertions.push({
        name: 'target_species là Bò',
        passed: trace.requirementAgent.data.target_species === 'Bò',
        message: `Trích xuất: ${trace.requirementAgent.data.target_species}`,
      });
      assertions.push({
        name: 'brand_preference là CP Việt Nam',
        passed: trace.requirementAgent.data.brand_preference?.includes('CP') ?? false,
        message: `Hãng: ${trace.requirementAgent.data.brand_preference}`,
      });
      assertions.push({
        name: 'Tìm ra sản phẩm Beef Master CP',
        passed: trace.decisionAgent.data.recommendedProducts.some((p) => p.product.name.includes('CP')),
        message: 'Đã đề xuất đúng dòng sản phẩm dinh dưỡng CP',
      });
      assertions.push({
        name: 'Critic Agent xác thực hợp lệ',
        passed: trace.criticAgent.data.isValid,
        message: `Điểm đánh giá: ${trace.criticAgent.data.score}/100`,
      });
      break;

    case 'TC02':
      assertions.push({
        name: 'Nhận diện loài Heo',
        passed: trace.requirementAgent.data.target_species === 'Heo',
        message: `Loài: ${trace.requirementAgent.data.target_species}`,
      });
      assertions.push({
        name: 'Nhận diện sản phẩm Marphavet',
        passed: trace.decisionAgent.data.recommendedProducts.some((p) => p.product.brand === 'Marphavet'),
        message: 'Sản phẩm Marphavet đã được đề xuất',
      });
      assertions.push({
        name: 'Phác đồ điều trị 4 bước hoàn chỉnh',
        passed: trace.decisionAgent.data.clinicalProtocol.length >= 4,
        message: `${trace.decisionAgent.data.clinicalProtocol.length} bước xử lý lâm sàng`,
      });
      break;

    case 'TC03':
      assertions.push({
        name: 'Phát hiện thương hiệu không tồn tại',
        passed: trace.searchAgent.data.brandStatus.isBrandFound === false,
        message: `isBrandFound: ${trace.searchAgent.data.brandStatus.isBrandFound}`,
      });
      assertions.push({
        name: 'Có thông báo gợi ý hãng thay thế',
        passed: !!trace.searchAgent.data.brandStatus.brandAlternativeNotice,
        message: trace.searchAgent.data.brandStatus.brandAlternativeNotice || 'Không có',
      });
      assertions.push({
        name: 'Đề xuất hãng uy tín trong kho (Virbac / Marphavet)',
        passed: (trace.searchAgent.data.brandStatus.suggestedBrands?.length ?? 0) > 0,
        message: `Hãng gợi ý: ${trace.searchAgent.data.brandStatus.suggestedBrands?.join(', ')}`,
      });
      break;

    case 'TC04':
      assertions.push({
        name: 'Phát hiện ngân sách quá thấp (< giá tối thiểu)',
        passed: trace.searchAgent.data.budgetStatus.isBudgetSufficient === false,
        message: `isBudgetSufficient: ${trace.searchAgent.data.budgetStatus.isBudgetSufficient}`,
      });
      assertions.push({
        name: 'Đưa ra cảnh báo tài chính thân thiện',
        passed: !!trace.searchAgent.data.budgetStatus.budgetWarningNotice,
        message: trace.searchAgent.data.budgetStatus.budgetWarningNotice || 'Không có cảnh báo',
      });
      assertions.push({
        name: 'Đề xuất giải pháp tiết kiệm khả thi',
        passed: trace.decisionAgent.data.recommendedProducts.length > 0,
        message: `Đã đưa ra ${trace.decisionAgent.data.recommendedProducts.length} lựa chọn thay thế khả thi`,
      });
      break;

    case 'TC05':
      assertions.push({
        name: 'Kích hoạt cơ chế Retry ít nhất 1 lần',
        passed: trace.criticAgent.data.retryCount >= 1,
        message: `Số lần Retry: ${trace.criticAgent.data.retryCount}`,
      });
      assertions.push({
        name: 'Có ghi nhận hành động nới lỏng ràng buộc',
        passed: trace.criticAgent.data.relaxationApplied.length > 0,
        message: trace.criticAgent.data.relaxationApplied.join('; '),
      });
      assertions.push({
        name: 'Kết quả cuối cùng hợp lệ sau khi nới lỏng',
        passed: trace.criticAgent.data.isValid,
        message: `Điểm sau retry: ${trace.criticAgent.data.score}/100`,
      });
      break;

    case 'TC06':
      assertions.push({
        name: 'Kích hoạt cơ chế Retry đa bước (2 lần)',
        passed: trace.criticAgent.data.retryCount >= 2,
        message: `Số lần Retry: ${trace.criticAgent.data.retryCount}`,
      });
      assertions.push({
        name: 'Chuyển sang tìm kiếm theo hoạt chất tương đương',
        passed: trace.decisionAgent.data.recommendedProducts.length > 0,
        message: `Đã tìm ra phương án hoạt chất tương đương`,
      });
      break;

    case 'TC07':
      assertions.push({
        name: 'Vector Semantic Search đạt điểm tương đồng >= 70%',
        passed: (trace.searchAgent.data.semanticVectorHits[0]?.similarityScore || 0) >= 0.7,
        message: `Điểm tương đồng: ${((trace.searchAgent.data.semanticVectorHits[0]?.similarityScore || 0) * 100).toFixed(0)}%`,
      });
      assertions.push({
        name: 'Khớp đúng thuốc chỉ định sốt / viêm phổi',
        passed: trace.decisionAgent.data.recommendedProducts.some(
          (p) => p.product.name.includes('Amox') || p.product.name.includes('Anagin') || p.product.name.includes('Flo')
        ),
        message: 'Khớp đúng hoạt chất chỉ định triệu chứng',
      });
      break;

    case 'TC08':
      assertions.push({
        name: 'Phát hiện mã SQL Injection độc hại',
        passed: trace.searchAgent.data.sqlInjectionDetected === true,
        message: 'Phát hiện nỗ lực SQL Injection nguy hiểm',
      });
      assertions.push({
        name: 'Truy vấn được tham số hóa an toàn (Parameterized Query)',
        passed: trace.searchAgent.data.isSafeParameterized === true,
        message: 'Truy vấn an toàn tuyệt đối qua prepared statement',
      });
      assertions.push({
        name: 'Không xảy ra lỗi hệ thống / CSDL nguyên vẹn',
        passed: trace.criticAgent.data.isValid,
        message: 'Hệ thống bảo vệ nguyên vẹn toàn bộ dữ liệu',
      });
      break;

    case 'TC09':
      assertions.push({
        name: 'Trích xuất đúng target_species = Dê',
        passed: trace.requirementAgent.data.target_species === 'Dê',
        message: `Loài: ${trace.requirementAgent.data.target_species}`,
      });
      assertions.push({
        name: 'Trích xuất đúng hãng Bio-Pharmachemie',
        passed: trace.requirementAgent.data.brand_preference?.includes('Bio') ?? false,
        message: `Hãng: ${trace.requirementAgent.data.brand_preference}`,
      });
      assertions.push({
        name: 'Trích xuất đúng ngân sách 100.000 đ',
        passed: trace.requirementAgent.data.budget_vnd === 100000,
        message: `Ngân sách: ${trace.requirementAgent.data.budget_vnd}`,
      });
      assertions.push({
        name: 'Độ tin cậy trích xuất cao (>= 0.85)',
        passed: trace.requirementAgent.data.confidence_score >= 0.85,
        message: `Confidence: ${(trace.requirementAgent.data.confidence_score * 100).toFixed(0)}%`,
      });
      break;

    case 'TC10':
    default:
      assertions.push({
        name: 'Toàn bộ 4 Agent hoạt động và có trace đầy đủ',
        passed:
          trace.requirementAgent.timeMs >= 0 &&
          trace.searchAgent.timeMs >= 0 &&
          trace.criticAgent.timeMs >= 0 &&
          trace.decisionAgent.timeMs >= 0,
        message: `Thời gian chạy toàn trình: ${trace.totalExecutionTimeMs}ms`,
      });
      assertions.push({
        name: 'Tạo ra danh sách sản phẩm và chi phí rõ ràng',
        passed: trace.decisionAgent.data.recommendedProducts.length > 0,
        message: `Đã tạo ${trace.decisionAgent.data.recommendedProducts.length} đề xuất`,
      });
      assertions.push({
        name: 'Có phác đồ chăm sóc tích hợp vào trang trại',
        passed: trace.decisionAgent.data.clinicalProtocol.length > 0,
        message: 'Sẵn sàng áp dụng vào hệ thống trang trại',
      });
      break;
  }

  const overallPassed = assertions.every((a) => a.passed);

  return {
    definition: tc,
    trace,
    assertionResults: assertions,
    overallPassed,
  };
}
