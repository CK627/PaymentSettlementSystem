<template>
	<view class="container">
		<view class="header">
			<view class="year-navigation">
				<button class="nav-button" @click="previousYear">‹</button>
				<text class="year-title">{{ currentYear }}年数据管理</text>
				<button class="nav-button" @click="nextYear">›</button>
			</view>
		</view>
		
		<view class="current-data">
			<view class="data-item">
				<text class="label">{{ currentYear }}年工作天数:</text>
				<text class="value">{{ yearWorkDays }}天</text>
			</view>
			<view class="data-item">
				<text class="label">每日平均工资:</text>
				<text class="value">{{ averageDailyWage }}元</text>
			</view>
			<view class="data-item">
				<text class="label">合计收入:</text>
				<text class="value">{{ totalYearIncome }}元</text>
			</view>
		</view>
		
		<view class="history-section">
			<text class="section-title">{{ currentYear }}年月入统计</text>
			<view v-if="monthlyStats.length === 0" class="empty-history">
				<text>{{ currentYear }}年暂无收入记录</text>
			</view>
			<view v-else class="monthly-list">
				<view v-for="(monthData, index) in monthlyStats" :key="index" class="monthly-item">
					<text class="month-title">{{ monthData.month }}月</text>
					<view class="monthly-details">
						<text>工作天数: {{ monthData.workDays }}天</text>
						<text>月收入: {{ monthData.totalIncome }}元</text>
						<text>日均收入: {{ monthData.avgDailyIncome }}元</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 月入统计图 -->
		<view class="chart-section">
			<view class="chart-title">{{ currentYear }}年月入统计图</view>
			<view class="chart-container">
				<view class="chart-horizontal">
					<view v-for="(item, index) in chartData" :key="index" class="horizontal-bar-item">
						<view class="month-label-left">{{ item.month }}月</view>
						<view class="bar-container">
							<view class="horizontal-bar" :style="{width: item.barWidth + '%'}"></view>
							<view class="bar-percentage">{{ item.barWidth }}%</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				days: 1, // 默认租用天数为1天
				pricePerDay: '', // 每天租金，初始为空字符串而不是0
				historyRecords: [], // 历史记录数组
				currentYear: new Date().getFullYear() // 当前查看的年份
			}
		},
		computed: {
			// 计算总租金
			totalPrice() {
				// 如果每日租金为空，则显示为0
				const price = this.pricePerDay === '' ? 0 : this.pricePerDay;
				return (price * this.days).toFixed(2);
			},
			// 获取当前年份的记录
			currentYearRecords() {
				return this.historyRecords.filter(record => {
					const recordDate = new Date(record.date);
					return recordDate.getFullYear() === this.currentYear;
				});
			},
			// 月度统计数据
			monthlyStats() {
				const monthlyData = {};
				
				// 按月份分组统计
				this.currentYearRecords.forEach(record => {
					const recordDate = new Date(record.date);
					const month = recordDate.getMonth() + 1; // 月份从0开始，需要+1
					const dateKey = recordDate.getFullYear() + '-' + month + '-' + recordDate.getDate();
					
					if (!monthlyData[month]) {
						monthlyData[month] = {
							month: month,
							totalIncome: 0,
							workDates: new Set()
						};
					}
					
					monthlyData[month].totalIncome += parseFloat(record.totalPrice || 0);
					monthlyData[month].workDates.add(dateKey);
				});
				
				// 转换为数组并计算日均收入
				const result = Object.values(monthlyData).map(data => ({
					month: data.month,
					workDays: data.workDates.size,
					totalIncome: data.totalIncome.toFixed(2),
					avgDailyIncome: data.workDates.size > 0 ? (data.totalIncome / data.workDates.size).toFixed(2) : '0.00'
				}));
				
				// 按月份排序
				return result.sort((a, b) => a.month - b.month);
			},
			// 图表数据
			chartData() {
				// 初始化12个月的数据
				const months = [];
				for (let i = 1; i <= 12; i++) {
					months.push({
						month: i,
						income: 0
					});
				}
				
				// 填充实际收入数据
			this.currentYearRecords.forEach(record => {
				const month = new Date(record.date).getMonth() + 1;
				months[month - 1].income += parseFloat(record.totalPrice || 0);
			});
				
				// 计算总收入
			const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
			
			// 计算百分比宽度（月收入占总收入的百分比）
			return months.map(month => ({
				...month,
				income: month.income.toFixed(2),
				barWidth: totalIncome > 0 ? Math.round((month.income / totalIncome) * 100) : 0
			}));
			},
			// 计算当前年份工作天数
			yearWorkDays() {
				// 统计有记录的不同日期数量
				const uniqueDates = new Set();
				this.currentYearRecords.forEach(record => {
					const recordDate = new Date(record.date);
					const dateKey = recordDate.getFullYear() + '-' + (recordDate.getMonth() + 1) + '-' + recordDate.getDate();
					uniqueDates.add(dateKey);
				});
				return uniqueDates.size;
			},
			// 计算当前年份合计收入
			totalYearIncome() {
				return this.currentYearRecords.reduce((total, record) => total + parseFloat(record.totalPrice || 0), 0).toFixed(2);
			},
			// 计算每日平均工资
			averageDailyWage() {
				if (this.yearWorkDays === 0) {
					return '0.00';
				}
				return (parseFloat(this.totalYearIncome) / this.yearWorkDays).toFixed(2);
			}
		},
		onLoad() {
			// 页面加载时加载上次保存的数据
			this.loadData();
			// 加载历史记录
			this.loadHistoryRecords();
		},
		onShow() {
			// 页面显示时加载数据，确保从首页切换过来时数据同步
			this.loadData();
			// 重新加载历史记录
			this.loadHistoryRecords();
		},
		methods: {
			// 从本地存储加载数据
			loadData() {
				uni.getStorage({
					key: 'rentalData',
					success: (res) => {
						if (res.data) {
							this.days = res.data.days;
							this.pricePerDay = res.data.pricePerDay;
						}
					}
				});
			},
			// 加载历史记录
			loadHistoryRecords() {
				uni.getStorage({
					key: 'historyRecords',
					success: (res) => {
						if (res.data) {
							this.historyRecords = res.data;
						}
					}
				});
			},
			// 切换到上一年
			previousYear() {
				this.currentYear--;
			},
			// 切换到下一年
			nextYear() {
				this.currentYear++;
			}
		}
	}
</script>

<style>
.container {
	padding: 20px;
}

.header {
	margin-bottom: 20px;
}

.year-navigation {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 15px;
}

.nav-button {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: #409eff;
	color: white;
	border: none;
	font-size: 18px;
	font-weight: bold;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.nav-button:hover {
	background-color: #337ecc;
}

.nav-button:active {
	background-color: #2b6cb0;
}

.year-title {
	font-size: 20px;
	font-weight: bold;
	text-align: center;
	color: #303133;
	min-width: 180px;
}

.title {
	font-size: 20px;
	font-weight: bold;
	text-align: center;
	display: block;
}

.current-data {
	background-color: #f8f8f8;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 20px;
}

.data-item {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10px;
}

.label {
	font-size: 16px;
	color: #606266;
}

.value {
	font-size: 16px;
	font-weight: bold;
	color: #303133;
}

.section-title {
	font-size: 18px;
	font-weight: bold;
	margin-bottom: 10px;
	display: block;
}

.empty-history {
	text-align: center;
	color: #909399;
	padding: 20px 0;
}

.monthly-list {
	margin-top: 10px;
}

.monthly-item {
	background-color: #f5f7fa;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 15px;
}

.month-title {
	font-size: 16px;
	color: #303133;
	font-weight: bold;
	display: block;
	margin-bottom: 10px;
}

.monthly-details {
	margin-bottom: 10px;
}

.monthly-details text {
	display: block;
	margin-bottom: 5px;
	font-size: 14px;
	color: #606266;
}

.chart-section {
	margin-top: 20px;
	padding: 15px;
	background-color: #f8f9fa;
	border-radius: 8px;
	border: 1px dashed #ddd;
}

.chart-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	margin-bottom: 15px;
	text-align: center;
}

.chart-container {
	background-color: #fff;
	border-radius: 8px;
	padding: 20px;
	box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chart-horizontal {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.horizontal-bar-item {
	display: flex;
	align-items: center;
	gap: 10px;
}

.month-label-left {
	width: 40px;
	font-size: 14px;
	color: #666;
	font-weight: 500;
	text-align: right;
}

.bar-container {
	flex: 1;
	display: flex;
	align-items: center;
	position: relative;
	height: 20px;
	background-color: #f0f0f0;
	border-radius: 10px;
	overflow: hidden;
}

.horizontal-bar {
	height: 100%;
	background: linear-gradient(90deg, #4CAF50, #45a049);
	border-radius: 10px;
	transition: width 0.3s ease;
	min-width: 2px;
}

.bar-percentage {
	position: absolute;
	right: 8px;
	font-size: 12px;
	color: #333;
	font-weight: 500;
	z-index: 1;
}


</style>
