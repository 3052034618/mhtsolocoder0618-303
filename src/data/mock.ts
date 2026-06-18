import type { Store, InspectionPlan, InspectionReport, Rectification, ScoreTemplate } from '@/types'

export const stores: Store[] = [
  {
    id: 's1', name: '味府·南京西路旗舰店', region: '华东', address: '上海市静安区南京西路1688号',
    manager: '王建国', phone: '138****1001', lastScore: 92, avgScore: 88, status: 'normal',
    scoreHistory: [
      { date: '2026-01', score: 85 }, { date: '2026-02', score: 87 }, { date: '2026-03', score: 90 },
      { date: '2026-04', score: 88 }, { date: '2026-05', score: 91 }, { date: '2026-06', score: 92 },
    ],
  },
  {
    id: 's2', name: '味府·天河城店', region: '华南', address: '广州市天河区天河路208号',
    manager: '李明辉', phone: '139****2002', lastScore: 78, avgScore: 75, status: 'warning',
    scoreHistory: [
      { date: '2026-01', score: 72 }, { date: '2026-02', score: 74 }, { date: '2026-03', score: 76 },
      { date: '2026-04', score: 73 }, { date: '2026-05', score: 77 }, { date: '2026-06', score: 78 },
    ],
  },
  {
    id: 's3', name: '味府·王府井店', region: '华北', address: '北京市东城区王府井大街255号',
    manager: '张秀英', phone: '136****3003', lastScore: 95, avgScore: 93, status: 'normal',
    scoreHistory: [
      { date: '2026-01', score: 90 }, { date: '2026-02', score: 91 }, { date: '2026-03', score: 93 },
      { date: '2026-04', score: 94 }, { date: '2026-05', score: 95 }, { date: '2026-06', score: 95 },
    ],
  },
  {
    id: 's4', name: '味府·春熙路店', region: '西南', address: '成都市锦江区春熙路128号',
    manager: '陈伟', phone: '137****4004', lastScore: 62, avgScore: 64, status: 'danger',
    scoreHistory: [
      { date: '2026-01', score: 68 }, { date: '2026-02', score: 65 }, { date: '2026-03', score: 63 },
      { date: '2026-04', score: 60 }, { date: '2026-05', score: 66 }, { date: '2026-06', score: 62 },
    ],
  },
  {
    id: 's5', name: '味府·西湖文化广场店', region: '华东', address: '杭州市下城区中山北路口',
    manager: '刘芳', phone: '135****5005', lastScore: 88, avgScore: 86, status: 'normal',
    scoreHistory: [
      { date: '2026-01', score: 82 }, { date: '2026-02', score: 84 }, { date: '2026-03', score: 85 },
      { date: '2026-04', score: 87 }, { date: '2026-05', score: 89 }, { date: '2026-06', score: 88 },
    ],
  },
  {
    id: 's6', name: '味府·福田COCO Park店', region: '华南', address: '深圳市福田区福华三路COCO Park',
    manager: '赵强', phone: '138****6006', lastScore: 58, avgScore: 60, status: 'danger',
    scoreHistory: [
      { date: '2026-01', score: 65 }, { date: '2026-02', score: 62 }, { date: '2026-03', score: 58 },
      { date: '2026-04', score: 55 }, { date: '2026-05', score: 62 }, { date: '2026-06', score: 58 },
    ],
  },
  {
    id: 's7', name: '味府·朝阳大悦城店', region: '华北', address: '北京市朝阳区朝阳北路101号',
    manager: '孙丽华', phone: '139****7007', lastScore: 85, avgScore: 83, status: 'normal',
    scoreHistory: [
      { date: '2026-01', score: 80 }, { date: '2026-02', score: 82 }, { date: '2026-03', score: 83 },
      { date: '2026-04', score: 84 }, { date: '2026-05', score: 86 }, { date: '2026-06', score: 85 },
    ],
  },
  {
    id: 's8', name: '味府·解放碑店', region: '西南', address: '重庆市渝中区解放碑步行街',
    manager: '周敏', phone: '136****8008', lastScore: 76, avgScore: 74, status: 'warning',
    scoreHistory: [
      { date: '2026-01', score: 70 }, { date: '2026-02', score: 72 }, { date: '2026-03', score: 74 },
      { date: '2026-04', score: 73 }, { date: '2026-05', score: 76 }, { date: '2026-06', score: 76 },
    ],
  },
  {
    id: 's9', name: '味府·苏州观前街店', region: '华东', address: '苏州市姑苏区观前街168号',
    manager: '吴志远', phone: '137****9009', lastScore: 91, avgScore: 89, status: 'normal',
    scoreHistory: [
      { date: '2026-01', score: 86 }, { date: '2026-02', score: 88 }, { date: '2026-03', score: 89 },
      { date: '2026-04', score: 90 }, { date: '2026-05', score: 92 }, { date: '2026-06', score: 91 },
    ],
  },
  {
    id: 's10', name: '味府·珠江新城店', region: '华南', address: '广州市天河区珠江新城花城大道',
    manager: '郑浩然', phone: '135****0010', lastScore: 83, avgScore: 81, status: 'normal',
    scoreHistory: [
      { date: '2026-01', score: 78 }, { date: '2026-02', score: 80 }, { date: '2026-03', score: 81 },
      { date: '2026-04', score: 82 }, { date: '2026-05', score: 84 }, { date: '2026-06', score: 83 },
    ],
  },
  {
    id: 's11', name: '味府·天津滨江道店', region: '华北', address: '天津市和平区滨江道200号',
    manager: '黄美玲', phone: '138****1011', lastScore: 55, avgScore: 58, status: 'danger',
    scoreHistory: [
      { date: '2026-01', score: 62 }, { date: '2026-02', score: 59 }, { date: '2026-03', score: 56 },
      { date: '2026-04', score: 53 }, { date: '2026-05', score: 60 }, { date: '2026-06', score: 55 },
    ],
  },
  {
    id: 's12', name: '味府·昆明南屏街店', region: '西南', address: '昆明市五华区南屏街88号',
    manager: '杨帆', phone: '139****2012', lastScore: 80, avgScore: 78, status: 'normal',
    scoreHistory: [
      { date: '2026-01', score: 74 }, { date: '2026-02', score: 76 }, { date: '2026-03', score: 78 },
      { date: '2026-04', score: 79 }, { date: '2026-05', score: 81 }, { date: '2026-06', score: 80 },
    ],
  },
]

export const supervisors = [
  { id: 'sup1', name: '陈督查' },
  { id: 'sup2', name: '林督导' },
  { id: 'sup3', name: '何检查' },
  { id: 'sup4', name: '马巡查' },
]

export const inspectionPlans: InspectionPlan[] = [
  { id: 'p1', storeId: 's1', storeName: '味府·南京西路旗舰店', supervisorId: 'sup1', supervisorName: '陈督查', type: 'scheduled', status: 'completed', scheduledDate: '2026-06-10', completedDate: '2026-06-10', templateId: 't1', templateName: '通用巡检评分表' },
  { id: 'p2', storeId: 's2', storeName: '味府·天河城店', supervisorId: 'sup2', supervisorName: '林督导', type: 'surprise', status: 'completed', scheduledDate: '2026-06-12', completedDate: '2026-06-12', templateId: 't1', templateName: '通用巡检评分表' },
  { id: 'p3', storeId: 's3', storeName: '味府·王府井店', supervisorId: 'sup1', supervisorName: '陈督查', type: 'scheduled', status: 'completed', scheduledDate: '2026-06-14', completedDate: '2026-06-14', templateId: 't2', templateName: '食品安全专项评分表' },
  { id: 'p4', storeId: 's4', storeName: '味府·春熙路店', supervisorId: 'sup3', supervisorName: '何检查', type: 'surprise', status: 'completed', scheduledDate: '2026-06-15', completedDate: '2026-06-15', templateId: 't1', templateName: '通用巡检评分表' },
  { id: 'p5', storeId: 's5', storeName: '味府·西湖文化广场店', supervisorId: 'sup2', supervisorName: '林督导', type: 'scheduled', status: 'completed', scheduledDate: '2026-06-16', completedDate: '2026-06-16', templateId: 't1', templateName: '通用巡检评分表' },
  { id: 'p6', storeId: 's6', storeName: '味府·福田COCO Park店', supervisorId: 'sup4', supervisorName: '马巡查', type: 'surprise', status: 'completed', scheduledDate: '2026-06-17', completedDate: '2026-06-17', templateId: 't3', templateName: '卫生状况专项评分表' },
  { id: 'p7', storeId: 's7', storeName: '味府·朝阳大悦城店', supervisorId: 'sup1', supervisorName: '陈督查', type: 'scheduled', status: 'planned', scheduledDate: '2026-06-20', templateId: 't1', templateName: '通用巡检评分表' },
  { id: 'p8', storeId: 's8', storeName: '味府·解放碑店', supervisorId: 'sup3', supervisorName: '何检查', type: 'surprise', status: 'planned', scheduledDate: '2026-06-22', templateId: 't1', templateName: '通用巡检评分表' },
  { id: 'p9', storeId: 's9', storeName: '味府·苏州观前街店', supervisorId: 'sup2', supervisorName: '林督导', type: 'scheduled', status: 'planned', scheduledDate: '2026-06-25', templateId: 't2', templateName: '食品安全专项评分表' },
  { id: 'p10', storeId: 's10', storeName: '味府·珠江新城店', supervisorId: 'sup4', supervisorName: '马巡查', type: 'scheduled', status: 'in_progress', scheduledDate: '2026-06-18', templateId: 't1', templateName: '通用巡检评分表' },
  { id: 'p11', storeId: 's11', storeName: '味府·天津滨江道店', supervisorId: 'sup3', supervisorName: '何检查', type: 'surprise', status: 'planned', scheduledDate: '2026-06-28', templateId: 't3', templateName: '卫生状况专项评分表' },
  { id: 'p12', storeId: 's12', storeName: '味府·昆明南屏街店', supervisorId: 'sup1', supervisorName: '陈督查', type: 'scheduled', status: 'planned', scheduledDate: '2026-07-02', templateId: 't1', templateName: '通用巡检评分表' },
]

export const inspectionReports: InspectionReport[] = [
  {
    id: 'r1', planId: 'p1', storeId: 's1', storeName: '味府·南京西路旗舰店', supervisorName: '陈督查', date: '2026-06-10', totalScore: 92, maxScore: 100, grade: 'A',
    items: [
      { id: 'ri1', category: '食材存储', name: '冷链温度达标', maxScore: 15, score: 14, passed: true },
      { id: 'ri2', category: '食材存储', name: '食材保质期管理', maxScore: 10, score: 9, passed: true },
      { id: 'ri3', category: '食材存储', name: '存储区域整洁', maxScore: 10, score: 10, passed: true },
      { id: 'ri4', category: '卫生状况', name: '厨房地面清洁', maxScore: 10, score: 9, passed: true },
      { id: 'ri5', category: '卫生状况', name: '餐具消毒合规', maxScore: 10, score: 10, passed: true },
      { id: 'ri6', category: '卫生状况', name: '垃圾桶加盖分类', maxScore: 5, score: 5, passed: true },
      { id: 'ri7', category: '出餐速度', name: '午高峰出餐时效', maxScore: 15, score: 13, passed: true },
      { id: 'ri8', category: '出餐速度', name: '外卖订单响应', maxScore: 10, score: 9, passed: true },
      { id: 'ri9', category: '员工仪容', name: '着装规范', maxScore: 5, score: 5, passed: true },
      { id: 'ri10', category: '员工仪容', name: '健康证公示', maxScore: 5, score: 5, passed: true },
      { id: 'ri11', category: '服务规范', name: '服务话术标准', maxScore: 5, score: 4, passed: true },
    ],
  },
  {
    id: 'r2', planId: 'p2', storeId: 's2', storeName: '味府·天河城店', supervisorName: '林督导', date: '2026-06-12', totalScore: 78, maxScore: 100, grade: 'C',
    items: [
      { id: 'ri12', category: '食材存储', name: '冷链温度达标', maxScore: 15, score: 10, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dirty+refrigerator+with+disorganized+food+items+in+restaurant+kitchen&image_size=landscape_4_3'], deductionReason: '冷藏柜温度8.5℃，超出标准范围2-8℃' },
      { id: 'ri13', category: '食材存储', name: '食材保质期管理', maxScore: 10, score: 7, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=expired+food+items+in+restaurant+storage+shelf&image_size=landscape_4_3'], deductionReason: '发现2包调味料已过保质期3天' },
      { id: 'ri14', category: '食材存储', name: '存储区域整洁', maxScore: 10, score: 8, passed: true },
      { id: 'ri15', category: '卫生状况', name: '厨房地面清洁', maxScore: 10, score: 7, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dirty+kitchen+floor+with+grease+stains+in+restaurant&image_size=landscape_4_3'], deductionReason: '灶台区域地面有明显油渍未清理' },
      { id: 'ri16', category: '卫生状况', name: '餐具消毒合规', maxScore: 10, score: 9, passed: true },
      { id: 'ri17', category: '卫生状况', name: '垃圾桶加盖分类', maxScore: 5, score: 5, passed: true },
      { id: 'ri18', category: '出餐速度', name: '午高峰出餐时效', maxScore: 15, score: 12, passed: true },
      { id: 'ri19', category: '出餐速度', name: '外卖订单响应', maxScore: 10, score: 8, passed: true },
      { id: 'ri20', category: '员工仪容', name: '着装规范', maxScore: 5, score: 4, passed: true },
      { id: 'ri21', category: '员工仪容', name: '健康证公示', maxScore: 5, score: 4, passed: true },
      { id: 'ri22', category: '服务规范', name: '服务话术标准', maxScore: 5, score: 4, passed: true },
    ],
  },
  {
    id: 'r3', planId: 'p3', storeId: 's3', storeName: '味府·王府井店', supervisorName: '陈督查', date: '2026-06-14', totalScore: 95, maxScore: 100, grade: 'A',
    items: [
      { id: 'ri23', category: '食材存储', name: '冷链温度达标', maxScore: 15, score: 15, passed: true },
      { id: 'ri24', category: '食材存储', name: '食材保质期管理', maxScore: 10, score: 10, passed: true },
      { id: 'ri25', category: '食材存储', name: '存储区域整洁', maxScore: 10, score: 10, passed: true },
      { id: 'ri26', category: '卫生状况', name: '厨房地面清洁', maxScore: 10, score: 9, passed: true },
      { id: 'ri27', category: '卫生状况', name: '餐具消毒合规', maxScore: 10, score: 10, passed: true },
      { id: 'ri28', category: '卫生状况', name: '垃圾桶加盖分类', maxScore: 5, score: 5, passed: true },
      { id: 'ri29', category: '出餐速度', name: '午高峰出餐时效', maxScore: 15, score: 14, passed: true },
      { id: 'ri30', category: '出餐速度', name: '外卖订单响应', maxScore: 10, score: 10, passed: true },
      { id: 'ri31', category: '员工仪容', name: '着装规范', maxScore: 5, score: 5, passed: true },
      { id: 'ri32', category: '员工仪容', name: '健康证公示', maxScore: 5, score: 4, passed: true },
      { id: 'ri33', category: '服务规范', name: '服务话术标准', maxScore: 5, score: 5, passed: true },
    ],
  },
  {
    id: 'r4', planId: 'p4', storeId: 's4', storeName: '味府·春熙路店', supervisorName: '何检查', date: '2026-06-15', totalScore: 62, maxScore: 100, grade: 'D',
    items: [
      { id: 'ri34', category: '食材存储', name: '冷链温度达标', maxScore: 15, score: 8, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=broken+refrigerator+in+restaurant+with+warm+temperature&image_size=landscape_4_3'], deductionReason: '冷藏柜故障，温度达12℃，食材存在安全风险' },
      { id: 'ri35', category: '食材存储', name: '食材保质期管理', maxScore: 10, score: 5, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=multiple+expired+food+packages+in+restaurant+storage&image_size=landscape_4_3'], deductionReason: '5种食材过期未清理，其中2种超过保质期1周' },
      { id: 'ri36', category: '食材存储', name: '存储区域整洁', maxScore: 10, score: 6, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=messy+storage+room+in+restaurant+with+cluttered+shelves&image_size=landscape_4_3'], deductionReason: '存储区杂物堆放，食材未离地存放' },
      { id: 'ri37', category: '卫生状况', name: '厨房地面清洁', maxScore: 10, score: 5, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=very+dirty+kitchen+floor+with+food+waste+and+grease&image_size=landscape_4_3'], deductionReason: '地面多处积水和食物残渣，排水沟堵塞' },
      { id: 'ri38', category: '卫生状况', name: '餐具消毒合规', maxScore: 10, score: 7, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=improperly+washed+dishes+and+utensils+in+restaurant&image_size=landscape_4_3'], deductionReason: '部分餐具消毒记录缺失，抽检发现水渍残留' },
      { id: 'ri39', category: '卫生状况', name: '垃圾桶加盖分类', maxScore: 5, score: 3, passed: false, deductionReason: '厨余垃圾桶未加盖，垃圾分类不明确' },
      { id: 'ri40', category: '出餐速度', name: '午高峰出餐时效', maxScore: 15, score: 10, passed: false, deductionReason: '3桌客人等待超30分钟' },
      { id: 'ri41', category: '出餐速度', name: '外卖订单响应', maxScore: 10, score: 7, passed: false, deductionReason: '外卖平均出餐时间22分钟，超出15分钟标准' },
      { id: 'ri42', category: '员工仪容', name: '着装规范', maxScore: 5, score: 3, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant+worker+without+proper+uniform+and+hairnet&image_size=landscape_4_3'], deductionReason: '2名员工未佩戴发帽，1名厨师围裙污损严重' },
      { id: 'ri43', category: '员工仪容', name: '健康证公示', maxScore: 5, score: 4, passed: true },
      { id: 'ri44', category: '服务规范', name: '服务话术标准', maxScore: 5, score: 4, passed: true },
    ],
  },
  {
    id: 'r5', planId: 'p5', storeId: 's5', storeName: '味府·西湖文化广场店', supervisorName: '林督导', date: '2026-06-16', totalScore: 88, maxScore: 100, grade: 'B',
    items: [
      { id: 'ri45', category: '食材存储', name: '冷链温度达标', maxScore: 15, score: 14, passed: true },
      { id: 'ri46', category: '食材存储', name: '食材保质期管理', maxScore: 10, score: 9, passed: true },
      { id: 'ri47', category: '食材存储', name: '存储区域整洁', maxScore: 10, score: 9, passed: true },
      { id: 'ri48', category: '卫生状况', name: '厨房地面清洁', maxScore: 10, score: 8, passed: true },
      { id: 'ri49', category: '卫生状况', name: '餐具消毒合规', maxScore: 10, score: 9, passed: true },
      { id: 'ri50', category: '卫生状况', name: '垃圾桶加盖分类', maxScore: 5, score: 4, passed: true },
      { id: 'ri51', category: '出餐速度', name: '午高峰出餐时效', maxScore: 15, score: 14, passed: true },
      { id: 'ri52', category: '出餐速度', name: '外卖订单响应', maxScore: 10, score: 9, passed: true },
      { id: 'ri53', category: '员工仪容', name: '着装规范', maxScore: 5, score: 5, passed: true },
      { id: 'ri54', category: '员工仪容', name: '健康证公示', maxScore: 5, score: 4, passed: true },
      { id: 'ri55', category: '服务规范', name: '服务话术标准', maxScore: 5, score: 5, passed: true },
    ],
  },
  {
    id: 'r6', planId: 'p6', storeId: 's6', storeName: '味府·福田COCO Park店', supervisorName: '马巡查', date: '2026-06-17', totalScore: 58, maxScore: 100, grade: 'D',
    items: [
      { id: 'ri56', category: '食材存储', name: '冷链温度达标', maxScore: 15, score: 7, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=unhygienic+refrigerator+with+cross+contamination+risk+in+restaurant&image_size=landscape_4_3'], deductionReason: '冷柜温度偏高且生熟食材混放' },
      { id: 'ri57', category: '食材存储', name: '食材保质期管理', maxScore: 10, score: 4, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rotten+vegetables+and+expired+food+in+restaurant+kitchen&image_size=landscape_4_3'], deductionReason: '大量食材过期，蔬菜有腐烂现象' },
      { id: 'ri58', category: '食材存储', name: '存储区域整洁', maxScore: 10, score: 5, passed: false, deductionReason: '存储间蟑螂活动痕迹' },
      { id: 'ri59', category: '卫生状况', name: '厨房地面清洁', maxScore: 10, score: 4, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flooded+dirty+kitchen+floor+with+grease+and+food+waste&image_size=landscape_4_3'], deductionReason: '地面严重积水油滑，存在安全隐患' },
      { id: 'ri60', category: '卫生状况', name: '餐具消毒合规', maxScore: 10, score: 6, passed: false, deductionReason: '消毒柜未正常工作，使用化学消毒但浓度不达标' },
      { id: 'ri61', category: '卫生状况', name: '垃圾桶加盖分类', maxScore: 5, score: 2, passed: false, photos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=overflowing+garbage+bin+without+lid+in+restaurant+kitchen&image_size=landscape_4_3'], deductionReason: '垃圾桶溢出未及时清理，无分类措施' },
      { id: 'ri62', category: '出餐速度', name: '午高峰出餐时效', maxScore: 15, score: 10, passed: false, deductionReason: '高峰期出餐严重延迟' },
      { id: 'ri63', category: '出餐速度', name: '外卖订单响应', maxScore: 10, score: 8, passed: true },
      { id: 'ri64', category: '员工仪容', name: '着装规范', maxScore: 5, score: 3, passed: false, deductionReason: '多名员工着装不规范' },
      { id: 'ri65', category: '员工仪容', name: '健康证公示', maxScore: 5, score: 3, passed: false, deductionReason: '2名员工健康证过期未更新' },
      { id: 'ri66', category: '服务规范', name: '服务话术标准', maxScore: 5, score: 2, passed: false, deductionReason: '服务人员缺乏基本话术培训' },
    ],
  },
]

export const rectifications: Rectification[] = [
  {
    id: 'rect1', reportId: 'r2', itemId: 'ri12', storeId: 's2', storeName: '味府·天河城店', itemName: '冷链温度达标', category: '食材存储', deductionReason: '冷藏柜温度8.5℃，超出标准范围2-8℃', status: 'completed', plan: '更换冷藏柜温控器，增加每日温度记录', deadline: '2026-06-20', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dirty+refrigerator+with+disorganized+food+items+in+restaurant+kitchen&image_size=landscape_4_3'], rectificationPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean+refrigerator+with+proper+temperature+display+in+restaurant&image_size=landscape_4_3'], submittedAt: '2026-06-18', confirmedAt: '2026-06-19', confirmedBy: '林督导', confirmNote: '整改到位，温度已恢复正常范围，建议持续监控温度记录。',
  },
  {
    id: 'rect2', reportId: 'r2', itemId: 'ri13', storeId: 's2', storeName: '味府·天河城店', itemName: '食材保质期管理', category: '食材存储', deductionReason: '发现2包调味料已过保质期3天', status: 'completed', plan: '建立每日保质期巡检制度，临期食材提前3天预警', deadline: '2026-06-22', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=expired+food+items+in+restaurant+storage+shelf&image_size=landscape_4_3'], rectificationPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=organized+food+storage+with+expiry+date+labels+in+restaurant&image_size=landscape_4_3'], submittedAt: '2026-06-20', confirmedAt: '2026-06-21', confirmedBy: '林督导', confirmNote: '保质期管理规范已建立，临期标识清晰。',
  },
  {
    id: 'rect3', reportId: 'r2', itemId: 'ri15', storeId: 's2', storeName: '味府·天河城店', itemName: '厨房地面清洁', category: '卫生状况', deductionReason: '灶台区域地面有明显油渍未清理', status: 'rectifying', plan: '增加午间清洁频次，采购专业去油清洁剂', deadline: '2026-06-25', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dirty+kitchen+floor+with+grease+stains+in+restaurant&image_size=landscape_4_3'], rectificationPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=clean+kitchen+floor+being+mopped+by+staff+in+restaurant&image_size=landscape_4_3'], submittedAt: '2026-06-22',
  },
  {
    id: 'rect4', reportId: 'r4', itemId: 'ri34', storeId: 's4', storeName: '味府·春熙路店', itemName: '冷链温度达标', category: '食材存储', deductionReason: '冷藏柜故障，温度达12℃，食材存在安全风险', status: 'planned', plan: '联系设备供应商维修，临时启用备用冷柜', deadline: '2026-06-16', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=broken+refrigerator+in+restaurant+with+warm+temperature&image_size=landscape_4_3'],
  },
  {
    id: 'rect5', reportId: 'r4', itemId: 'ri35', storeId: 's4', storeName: '味府·春熙路店', itemName: '食材保质期管理', category: '食材存储', deductionReason: '5种食材过期未清理，其中2种超过保质期1周', status: 'planned', plan: '立即清理所有过期食材，建立食材入库登记台账', deadline: '2026-06-17', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=multiple+expired+food+packages+in+restaurant+storage&image_size=landscape_4_3'],
  },
  {
    id: 'rect6', reportId: 'r4', itemId: 'ri36', storeId: 's4', storeName: '味府·春熙路店', itemName: '存储区域整洁', category: '食材存储', deductionReason: '存储区杂物堆放，食材未离地存放', status: 'pending', deadline: '2026-06-25', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=messy+storage+room+in+restaurant+with+cluttered+shelves&image_size=landscape_4_3'],
  },
  {
    id: 'rect7', reportId: 'r4', itemId: 'ri37', storeId: 's4', storeName: '味府·春熙路店', itemName: '厨房地面清洁', category: '卫生状况', deductionReason: '地面多处积水和食物残渣，排水沟堵塞', status: 'pending', deadline: '2026-06-19', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=very+dirty+kitchen+floor+with+food+waste+and+grease&image_size=landscape_4_3'],
  },
  {
    id: 'rect8', reportId: 'r4', itemId: 'ri38', storeId: 's4', storeName: '味府·春熙路店', itemName: '餐具消毒合规', category: '卫生状况', deductionReason: '部分餐具消毒记录缺失，抽检发现水渍残留', status: 'pending', deadline: '2026-06-26', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=improperly+washed+dishes+and+utensils+in+restaurant&image_size=landscape_4_3'],
  },
  {
    id: 'rect9', reportId: 'r6', itemId: 'ri56', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '冷链温度达标', category: '食材存储', deductionReason: '冷柜温度偏高且生熟食材混放', status: 'planned', plan: '调整冷柜温度，严格执行生熟分区存放', deadline: '2026-06-24', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=unhygienic+refrigerator+with+cross+contamination+risk+in+restaurant&image_size=landscape_4_3'],
  },
  {
    id: 'rect10', reportId: 'r6', itemId: 'ri57', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '食材保质期管理', category: '食材存储', deductionReason: '大量食材过期，蔬菜有腐烂现象', status: 'pending', deadline: '2026-06-18', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rotten+vegetables+and+expired+food+in+restaurant+kitchen&image_size=landscape_4_3'],
  },
  {
    id: 'rect11', reportId: 'r6', itemId: 'ri59', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '厨房地面清洁', category: '卫生状况', deductionReason: '地面严重积水油滑，存在安全隐患', status: 'pending', deadline: '2026-06-20', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=flooded+dirty+kitchen+floor+with+grease+and+food+waste&image_size=landscape_4_3'],
  },
  {
    id: 'rect12', reportId: 'r6', itemId: 'ri60', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '餐具消毒合规', category: '卫生状况', deductionReason: '消毒柜未正常工作，使用化学消毒但浓度不达标', status: 'pending', deadline: '2026-06-26', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=old+broken+dishwasher+in+restaurant+kitchen&image_size=landscape_4_3'],
  },
  {
    id: 'rect13', reportId: 'r6', itemId: 'ri61', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '垃圾桶加盖分类', category: '卫生状况', deductionReason: '垃圾桶溢出未及时清理，无分类措施', status: 'pending', deadline: '2026-06-21', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=overflowing+garbage+bin+without+lid+in+restaurant+kitchen&image_size=landscape_4_3'],
  },
  {
    id: 'rect14', reportId: 'r6', itemId: 'ri64', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '着装规范', category: '员工仪容', deductionReason: '多名员工着装不规范', status: 'pending', deadline: '2026-06-26', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant+worker+without+proper+uniform+and+hairnet&image_size=landscape_4_3'],
  },
  {
    id: 'rect15', reportId: 'r6', itemId: 'ri65', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '健康证公示', category: '员工仪容', deductionReason: '2名员工健康证过期未更新', status: 'pending', deadline: '2026-06-30', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=expired+health+certificate+notice+on+restaurant+wall&image_size=landscape_4_3'],
  },
  {
    id: 'rect16', reportId: 'r6', itemId: 'ri66', storeId: 's6', storeName: '味府·福田COCO Park店', itemName: '服务话术标准', category: '服务规范', deductionReason: '服务人员缺乏基本话术培训', status: 'pending', deadline: '2026-06-28', problemPhotos: ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=restaurant+staff+training+session&image_size=landscape_4_3'],
  },
]

export const scoreTemplates: ScoreTemplate[] = [
  {
    id: 't1', name: '通用巡检评分表', description: '适用于日常常规巡检的标准化评分表', isActive: true, usageCount: 45,
    categories: [
      { id: 'tc1', name: '食材存储', weight: 35, items: [
        { id: 'ti1', name: '冷链温度达标', maxScore: 15, description: '冷藏2-8℃，冷冻-18℃以下' },
        { id: 'ti2', name: '食材保质期管理', maxScore: 10, description: '无过期食材，临期标识清晰' },
        { id: 'ti3', name: '存储区域整洁', maxScore: 10, description: '离地存放，区域划分合理' },
      ]},
      { id: 'tc2', name: '卫生状况', weight: 25, items: [
        { id: 'ti4', name: '厨房地面清洁', maxScore: 10, description: '地面无积水油污，排水通畅' },
        { id: 'ti5', name: '餐具消毒合规', maxScore: 10, description: '消毒记录完整，抽检合格' },
        { id: 'ti6', name: '垃圾桶加盖分类', maxScore: 5, description: '加盖密闭，分类正确' },
      ]},
      { id: 'tc3', name: '出餐速度', weight: 25, items: [
        { id: 'ti7', name: '午高峰出餐时效', maxScore: 15, description: '堂食15分钟内出餐' },
        { id: 'ti8', name: '外卖订单响应', maxScore: 10, description: '外卖15分钟内接单出餐' },
      ]},
      { id: 'tc4', name: '员工仪容', weight: 10, items: [
        { id: 'ti9', name: '着装规范', maxScore: 5, description: '工装整洁，配戴发帽/围裙' },
        { id: 'ti10', name: '健康证公示', maxScore: 5, description: '全员持证且在有效期内' },
      ]},
      { id: 'tc5', name: '服务规范', weight: 5, items: [
        { id: 'ti11', name: '服务话术标准', maxScore: 5, description: '迎宾/送客/推荐话术规范' },
      ]},
    ],
  },
  {
    id: 't2', name: '食品安全专项评分表', description: '针对食品安全合规性的深度检查', isActive: true, usageCount: 18,
    categories: [
      { id: 'tc6', name: '食材安全', weight: 50, items: [
        { id: 'ti12', name: '供应商资质', maxScore: 15, description: '所有供应商资质齐全有效' },
        { id: 'ti13', name: '进货查验记录', maxScore: 15, description: '进货台账完整，查验记录规范' },
        { id: 'ti14', name: '食材留样制度', maxScore: 10, description: '每餐留样48小时，记录完整' },
        { id: 'ti15', name: '冷链运输合规', maxScore: 10, description: '冷链食材运输温度全程达标' },
      ]},
      { id: 'tc7', name: '加工安全', weight: 30, items: [
        { id: 'ti16', name: '生熟分区操作', maxScore: 15, description: '砧板刀具分色管理，生熟分开' },
        { id: 'ti17', name: '烹饪温度达标', maxScore: 10, description: '中心温度≥70℃' },
        { id: 'ti18', name: '食品添加剂管理', maxScore: 5, description: '专人管理，使用量合规' },
      ]},
      { id: 'tc8', name: '人员卫生', weight: 20, items: [
        { id: 'ti19', name: '洗手消毒规范', maxScore: 10, description: '操作前洗手消毒，流程正确' },
        { id: 'ti20', name: '疾病防控', maxScore: 10, description: '带病上岗管理，体温检测' },
      ]},
    ],
  },
  {
    id: 't3', name: '卫生状况专项评分表', description: '针对门店卫生状况的深度检查', isActive: true, usageCount: 12,
    categories: [
      { id: 'tc9', name: '前厅卫生', weight: 30, items: [
        { id: 'ti21', name: '就餐区清洁', maxScore: 15, description: '桌面/地面/座椅无污渍' },
        { id: 'ti22', name: '卫生间清洁', maxScore: 10, description: '定时清洁，用品充足' },
        { id: 'ti23', name: '空气品质', maxScore: 5, description: '通风良好，无异味' },
      ]},
      { id: 'tc10', name: '后厨卫生', weight: 50, items: [
        { id: 'ti24', name: '地面排水清洁', maxScore: 15, description: '无积水油污，排水沟畅通' },
        { id: 'ti25', name: '设备清洁', maxScore: 15, description: '设备表面无油垢，定期深度清洁' },
        { id: 'ti26', name: '墙面天花板', maxScore: 10, description: '无霉斑无脱落无蛛网' },
        { id: 'ti27', name: '防虫防鼠措施', maxScore: 10, description: '挡鼠板/灭蝇灯/纱窗完好' },
      ]},
      { id: 'tc11', name: '消毒管理', weight: 20, items: [
        { id: 'ti28', name: '消毒制度执行', maxScore: 10, description: '消毒频次达标，记录完整' },
        { id: 'ti29', name: '消毒设备状态', maxScore: 10, description: '消毒柜/紫外线灯正常工作' },
      ]},
    ],
  },
  {
    id: 't4', name: '服务专项评分表', description: '针对服务质量的专项评估', isActive: true, usageCount: 8,
    categories: [
      { id: 'tc12', name: '服务态度', weight: 40, items: [
        { id: 'ti30', name: '迎宾送客', maxScore: 15, description: '主动问候，礼貌送别' },
        { id: 'ti31', name: '点餐服务', maxScore: 15, description: '推荐得当，耐心解答' },
        { id: 'ti32', name: '投诉处理', maxScore: 10, description: '及时响应，妥善处理' },
      ]},
      { id: 'tc13', name: '服务效率', weight: 30, items: [
        { id: 'ti33', name: '上菜速度', maxScore: 15, description: '承诺时间内上菜' },
        { id: 'ti34', name: '结账效率', maxScore: 15, description: '快速准确，多种支付' },
      ]},
      { id: 'tc14', name: '环境氛围', weight: 30, items: [
        { id: 'ti35', name: '门店形象', maxScore: 15, description: '装修完好，品牌元素统一' },
        { id: 'ti36', name: '音乐温度', maxScore: 15, description: '背景音乐适宜，温度舒适' },
      ]},
    ],
  },
  {
    id: 't5', name: '出餐速度专项评分表', description: '针对出餐效率的专项检查', isActive: false, usageCount: 5,
    categories: [
      { id: 'tc15', name: '堂食出餐', weight: 50, items: [
        { id: 'ti37', name: '午高峰出餐时效', maxScore: 20, description: '15分钟内出餐率≥90%' },
        { id: 'ti38', name: '晚高峰出餐时效', maxScore: 15, description: '20分钟内出餐率≥90%' },
        { id: 'ti39', name: '菜品出品质量', maxScore: 15, description: '出餐速度快不影响品质' },
      ]},
      { id: 'tc16', name: '外卖出餐', weight: 30, items: [
        { id: 'ti40', name: '接单响应速度', maxScore: 15, description: '3分钟内接单' },
        { id: 'ti41', name: '打包规范性', maxScore: 15, description: '密封完好，无洒漏' },
      ]},
      { id: 'tc17', name: '后厨协作', weight: 20, items: [
        { id: 'ti42', name: '前后厅配合', maxScore: 10, description: '传菜流畅，沟通顺畅' },
        { id: 'ti43', name: '备料充足度', maxScore: 10, description: '高峰期不缺料' },
      ]},
    ],
  },
  {
    id: 't6', name: '新店开业评分表', description: '新门店开业前的验收检查', isActive: true, usageCount: 3,
    categories: [
      { id: 'tc18', name: '设施设备', weight: 40, items: [
        { id: 'ti44', name: '设备安装调试', maxScore: 20, description: '所有设备安装到位，调试正常' },
        { id: 'ti45', name: '消防安全合规', maxScore: 10, description: '灭火器/烟感/喷淋齐全有效' },
        { id: 'ti46', name: '排烟排水系统', maxScore: 10, description: '排烟/排水系统运行正常' },
      ]},
      { id: 'tc19', name: '人员配备', weight: 30, items: [
        { id: 'ti47', name: '人员到岗率', maxScore: 15, description: '各岗位人员配备齐全' },
        { id: 'ti48', name: '培训考核合格', maxScore: 15, description: '全员通过上岗培训考核' },
      ]},
      { id: 'tc20', name: '物资准备', weight: 30, items: [
        { id: 'ti49', name: '食材储备充足', maxScore: 15, description: '首周食材储备到位' },
        { id: 'ti50', name: '物料耗材齐备', maxScore: 15, description: '餐具/包装/清洁用品等齐备' },
      ]},
    ],
  },
]

export const categoryIssueFrequency = [
  { category: '食材存储', count: 28, percentage: 31.1 },
  { category: '卫生状况', count: 24, percentage: 26.7 },
  { category: '出餐速度', count: 16, percentage: 17.8 },
  { category: '员工仪容', count: 12, percentage: 13.3 },
  { category: '服务规范', count: 10, percentage: 11.1 },
]

export const regionRanking = [
  { region: '华北', avgScore: 84.3, storeCount: 3 },
  { region: '华东', avgScore: 87.7, storeCount: 3 },
  { region: '华南', avgScore: 73.0, storeCount: 3 },
  { region: '西南', avgScore: 72.7, storeCount: 3 },
]
