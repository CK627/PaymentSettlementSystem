<template>
	<view class="calendar-container">
		<view class="header">
			<text class="title">工作日历</text>
		</view>
		
		<!-- 月度统计信息 -->
		<view class="month-stats">
			<text class="stats-text">本月工作天数：{{ monthWorkDays }}天</text>
			<text class="stats-text">本月合计工资：{{ monthTotalIncome }}元</text>
		</view>
		
		<view class="calendar-controls">
			<button @click="prevMonth" class="nav-button">上个月</button>
			<text class="current-month">{{ currentYear }}年{{ currentMonth + 1 }}月</text>
			<button @click="nextMonth" class="nav-button">下个月</button>
		</view>
		
		<view class="calendar">
			<!-- 星期标题 -->
			<view class="weekdays">
				<text v-for="(day, index) in weekdays" :key="index" class="weekday">{{ day }}</text>
			</view>
			
			<!-- 日历格子 -->
			<view class="days">
				<!-- 前导空白格子 -->
				<view v-for="n in firstDayOfMonth" :key="'empty-'+n" class="day empty"></view>
				
				<!-- 日期格子 -->
				<view 
					v-for="day in daysInMonth" 
					:key="day" 
					:class="['day', isToday(day) ? 'today' : '', hasRecord(day) ? 'has-record' : '', selectedDay === day ? 'selected' : '']" 
					@click="selectDay(day)"
					@longpress="showDayMenu(day)"
				>
					<text>{{ day }}</text>
					<view v-if="hasRecord(day)" class="record-dot"></view>
				</view>
			</view>
		</view>
		
		<!-- 选中日期的记录 -->
		<view v-if="selectedDayRecords.length > 0" class="day-records">
			<view class="records-header">
				<text class="section-title">{{ currentYear }}年{{ currentMonth + 1 }}月{{ selectedDay }}日的记录</text>
				<button @click="addRecord" class="add-button" size="mini" type="primary">新增记录</button>
			</view>
			<view v-for="(record, index) in selectedDayRecords" :key="index" class="record-item">
				<rich-text class="record-time" :nodes="formatTimeWithSupplement(record)"></rich-text>
				<view class="record-details">
					<text>人数: {{ record.days }}人</text>
					<text>每日工资: {{ record.pricePerDay }}元</text>
					<text>合计工资: {{ record.totalPrice }}元</text>
					<text v-if="record.remark">备注: {{ record.remark }}</text>
				</view>
				<view class="record-actions">
					<button type="default" size="mini" @click="editRecord(record, index)" class="action-button">修改</button>
					<button type="warn" size="mini" @click="deleteRecord(index)" class="action-button">删除</button>
				</view>
			</view>
		</view>
		
		<view v-else-if="selectedDay > 0" class="no-records">
			<text>{{ currentYear }}年{{ currentMonth + 1 }}月{{ selectedDay }}日没有记录</text>
			<button @click="addRecord" class="add-button" size="mini" type="primary">新增记录</button>
		</view>
		
		<!-- 编辑记录弹窗 -->
		<view v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
			<view class="modal-content" @click.stop>
				<view class="modal-header">
					<text class="modal-title">{{ editingRecord ? '修改记录' : '新增记录' }}</text>
					<button @click="closeEditModal" class="close-button">×</button>
				</view>
				<view class="modal-body">
					<view class="form-item">
						<text class="label">每日工资：</text>
						<input v-model="editForm.pricePerDay" type="number" class="input" placeholder="请输入每日工资" />
					</view>
					<view class="form-item">
						<text class="label">备注：</text>
						<input v-model="editForm.remark" type="text" class="input" placeholder="请输入备注（可选）" />
					</view>
					<view class="form-item">
						<text class="label">人数：</text>
						<view class="days-input-container">
							<button @click="decreaseDays" class="days-button" :disabled="editForm.days <= 1">-</button>
							<input v-model="editForm.days" type="number" class="days-input" placeholder="请输入人数" />
							<button @click="increaseDays" class="days-button">+</button>
						</view>
					</view>
				</view>
				<view class="modal-footer">
					<button @click="closeEditModal" class="cancel-button">取消</button>
					<button @click="saveRecord" class="save-button" type="primary">保存</button>
				</view>
			</view>
		</view>
		
		<view v-if="message" class="message">
			<text :class="['message-text', messageType]">{{ message }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				weekdays: ['日', '一', '二', '三', '四', '五', '六'],
				currentYear: new Date().getFullYear(),
				currentMonth: new Date().getMonth(),
				selectedDay: 0,
				historyRecords: [],
				selectedDayRecords: [],
				message: '',
				messageType: 'success',
				showEditModal: false,
				editingRecord: null,
				editingIndex: -1,
				editForm: {
					days: '',
					pricePerDay: '',
					remark: ''
				}
			}
		},
		computed: {
			// 计算当月的天数
			daysInMonth() {
				return new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
			},
			// 计算当月第一天是星期几
			firstDayOfMonth() {
				return new Date(this.currentYear, this.currentMonth, 1).getDay();
			},
			// 计算当月工作人数
			monthWorkDays() {
				const monthRecords = this.historyRecords.filter(record => {
					const recordDate = new Date(record.date);
					return recordDate.getFullYear() === this.currentYear && 
						   recordDate.getMonth() === this.currentMonth;
				});
				// 统计有记录的不同日期数量
				const uniqueDates = new Set();
				monthRecords.forEach(record => {
					const recordDate = new Date(record.date);
					const dateKey = recordDate.getDate(); // 获取日期（1-31）
					uniqueDates.add(dateKey);
				});
				return uniqueDates.size;
			},
			// 计算当月总收入
			monthTotalIncome() {
				const monthRecords = this.historyRecords.filter(record => {
					const recordDate = new Date(record.date);
					return recordDate.getFullYear() === this.currentYear && 
						   recordDate.getMonth() === this.currentMonth;
				});
				return monthRecords.reduce((total, record) => total + parseFloat(record.totalPrice || 0), 0).toFixed(2);
			}
		},
		onLoad() {
			// 加载历史记录
			this.loadHistoryRecords();
		},
		onShow() {
			// 页面显示时重新加载历史记录
			this.loadHistoryRecords();
			// 如果有选中的日期，重新刷新该日期的记录显示
			if (this.selectedDay > 0) {
				// 使用setTimeout确保loadHistoryRecords完成后再刷新
				setTimeout(() => {
					this.selectDay(this.selectedDay);
				}, 100);
			}
		},
		methods: {
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
			// 保存历史记录
			saveHistoryRecords() {
				uni.setStorage({
					key: 'historyRecords',
					data: this.historyRecords
				});
			},
			// 切换到上个月
			prevMonth() {
				if (this.currentMonth === 0) {
					this.currentYear--;
					this.currentMonth = 11;
				} else {
					this.currentMonth--;
				}
				this.selectedDay = 0;
				this.selectedDayRecords = [];
			},
			// 切换到下个月
			nextMonth() {
				if (this.currentMonth === 11) {
					this.currentYear++;
					this.currentMonth = 0;
				} else {
					this.currentMonth++;
				}
				this.selectedDay = 0;
				this.selectedDayRecords = [];
			},
			// 判断是否是今天
			isToday(day) {
				const today = new Date();
				return this.currentYear === today.getFullYear() && 
					   this.currentMonth === today.getMonth() && 
					   day === today.getDate();
			},
			// 判断某天是否有记录
			hasRecord(day) {
				return this.historyRecords.some(record => {
					const recordDate = new Date(record.date);
					return recordDate.getFullYear() === this.currentYear && 
						   recordDate.getMonth() === this.currentMonth && 
						   recordDate.getDate() === day;
				});
			},
			// 选择某一天
			selectDay(day) {
				this.selectedDay = day;
				
				// 筛选当天的记录
				this.selectedDayRecords = this.historyRecords.filter(record => {
					const recordDate = new Date(record.date);
					return recordDate.getFullYear() === this.currentYear && 
						   recordDate.getMonth() === this.currentMonth && 
						   recordDate.getDate() === day;
				});
				
				// 强制触发视图更新，确保即使点击相同日期也能刷新显示
				this.$forceUpdate();
			},
			// 显示日期菜单
			showDayMenu(day) {
				this.selectDay(day);
				if (!this.hasRecord(day)) {
					this.addRecord();
				}
			},
			// 新增记录
			addRecord() {
				if (this.selectedDay === 0) {
					this.showMessage('请先选择日期', 'error');
					return;
				}
				this.editingRecord = null;
				this.editingIndex = -1;
				this.editForm = {
				days: '1',
				pricePerDay: '',
				remark: ''
			};
				this.showEditModal = true;
			},
			// 编辑记录
			editRecord(record, index) {
				this.editingRecord = record;
				this.editingIndex = index;
				this.editForm = {
				days: record.days.toString(),
				pricePerDay: record.pricePerDay.toString(),
				remark: record.remark || ''
			};
				this.showEditModal = true;
			},
			// 删除记录
			deleteRecord(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这条记录吗？',
					success: (res) => {
						if (res.confirm) {
							const recordToDelete = this.selectedDayRecords[index];
							// 从总记录中删除
							const globalIndex = this.historyRecords.findIndex(record => 
								record.date === recordToDelete.date && 
								record.days === recordToDelete.days && 
								record.pricePerDay === recordToDelete.pricePerDay
							);
							if (globalIndex !== -1) {
								this.historyRecords.splice(globalIndex, 1);
								this.saveHistoryRecords();
								// 更新当天记录
								this.selectDay(this.selectedDay);
								// 强制触发视图更新
								this.$forceUpdate();
								this.showMessage('记录已删除', 'success');
							}
						}
					}
				});
			},
			// 保存记录
			saveRecord() {
				if (!this.editForm.days || !this.editForm.pricePerDay) {
					this.showMessage('请填写完整信息', 'error');
					return;
				}
				
				const days = parseInt(this.editForm.days);
				const pricePerDay = parseFloat(this.editForm.pricePerDay);
				const totalPrice = days * pricePerDay;
				
				if (this.editingRecord) {
					// 编辑现有记录
					const globalIndex = this.historyRecords.findIndex(record => 
						record.date === this.editingRecord.date && 
						record.days === this.editingRecord.days && 
						record.pricePerDay === this.editingRecord.pricePerDay
					);
					if (globalIndex !== -1) {
					this.historyRecords[globalIndex] = {
						...this.historyRecords[globalIndex],
						days: days,
						pricePerDay: pricePerDay,
						totalPrice: totalPrice,
						remark: this.editForm.remark
					};
				}
				} else {
					// 新增记录
					const now = new Date();
					const recordDate = new Date(this.currentYear, this.currentMonth, this.selectedDay, now.getHours(), now.getMinutes(), now.getSeconds());
					const newRecord = {
					date: recordDate.toISOString(),
					days: days,
					pricePerDay: pricePerDay,
					totalPrice: totalPrice,
					remark: this.editForm.remark
				};
					this.historyRecords.push(newRecord);
				}
				
				this.saveHistoryRecords();
				this.selectDay(this.selectedDay);
				// 强制触发视图更新
				this.$forceUpdate();
				this.closeEditModal();
				this.showMessage(this.editingRecord ? '记录已更新' : '记录已添加', 'success');
			},
			// 关闭编辑弹窗
			closeEditModal() {
				this.showEditModal = false;
				this.editingRecord = null;
				this.editingIndex = -1;
				this.editForm = {
				days: '',
				pricePerDay: '',
				remark: ''
			};
			},
			// 增加人数
			increaseDays() {
				const currentDays = parseInt(this.editForm.days) || 0;
				this.editForm.days = (currentDays + 1).toString();
			},
			// 减少人数
			decreaseDays() {
				const currentDays = parseInt(this.editForm.days) || 1;
				if (currentDays > 1) {
					this.editForm.days = (currentDays - 1).toString();
				}
			},
			// 格式化时间（显示完整时间：年月日时分）
			formatTime(dateStr) {
				const date = new Date(dateStr);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');
				const hours = date.getHours().toString().padStart(2, '0');
				const minutes = date.getMinutes().toString().padStart(2, '0');
				return `${year}年${month}月${day}日 ${hours}:${minutes}`;
			},
			// 格式化时间并添加补字标识
			formatTimeWithSupplement(record) {
				const timeStr = this.formatTime(record.date);
				const isSupplementary = this.isSupplementaryRecord(record);
				return isSupplementary ? `${timeStr} <span class="supplement-text">补</span>` : timeStr;
			},
			// 判断是否为补录（不是当日添加的记录）
			isSupplementaryRecord(record) {
				const recordDate = new Date(record.date);
				const now = new Date();
				
				// 获取记录所属的日期（年月日）
				const recordDay = recordDate.getDate();
				const recordMonth = recordDate.getMonth();
				const recordYear = recordDate.getFullYear();
				
				// 获取当前日期（年月日）
				const currentDay = now.getDate();
				const currentMonth = now.getMonth();
				const currentYear = now.getFullYear();
				
				// 如果记录所属日期不是今天，则为补录
				return !(recordYear === currentYear && recordMonth === currentMonth && recordDay === currentDay);
			},

			// 显示消息
			showMessage(msg, type = 'success') {
				this.message = msg;
				this.messageType = type;
				
				// 3秒后清除消息
				setTimeout(() => {
					this.message = '';
				}, 3000);
			}
		}
	}
</script>

<style>
.calendar-container {
	padding: 20px;
}

.header {
	margin-bottom: 20px;
}

.title {
	font-size: 20px;
	font-weight: bold;
	text-align: center;
	display: block;
}

.month-stats {
	background-color: #f0f9ff;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 15px;
	border-left: 4px solid #007AFF;
}

.stats-text {
	display: block;
	font-size: 14px;
	color: #333;
	margin-bottom: 5px;
	font-weight: 500;
}

.calendar-controls {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
}

.nav-button {
	padding: 5px 10px;
	font-size: 14px;
	line-height: 1.5;
	margin: 0;
}

.current-month {
	font-size: 16px;
	font-weight: bold;
}

.calendar {
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	overflow: hidden;
	margin-bottom: 20px;
}

.weekdays {
	display: flex;
	background-color: #f8f8f8;
}

.weekday {
	flex: 1;
	text-align: center;
	padding: 10px 0;
	font-weight: bold;
	color: #606266;
}

.days {
	display: flex;
	flex-wrap: wrap;
}

.day {
	width: 14.28%;
	height: 50px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	position: relative;
	border-bottom: 1px solid #f0f0f0;
	border-right: 1px solid #f0f0f0;
	box-sizing: border-box;
	cursor: pointer;
}

.day:nth-child(7n) {
	border-right: none;
}

.day.empty {
	background-color: #f9f9f9;
}

.day.today {
	background-color: #e6f7ff;
}

.day.has-record {
	font-weight: bold;
	background-color: #ffebee;
	color: #d32f2f;
}

.day.selected {
	background-color: #007AFF;
	color: white;
	font-weight: bold;
	border: 2px solid #0056b3;
	box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.record-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background-color: #d32f2f;
	position: absolute;
	bottom: 5px;
}

.day-records {
	margin-top: 20px;
}

.records-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
}

.section-title {
	font-size: 16px;
	font-weight: bold;
	display: block;
}

.add-button {
	margin: 0;
}

.record-item {
	background-color: #f5f7fa;
	border-radius: 8px;
	padding: 15px;
	margin-bottom: 10px;
}

.record-time {
	font-size: 14px;
	color: #909399;
	display: block;
	margin-bottom: 5px;
}

.record-details {
	margin-bottom: 10px;
}

.record-details text {
	display: block;
	margin-bottom: 5px;
	font-size: 14px;
}

.record-actions {
	display: flex;
	gap: 10px;
}

.action-button {
	margin: 0;
	flex: 1;
}

.no-records {
	text-align: center;
	color: #909399;
	padding: 20px 0;
}

.no-records text {
	display: block;
	margin-bottom: 15px;
}

.no-records .add-button {
	margin-top: 10px;
}

.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 1000;
}

.modal-content {
	background-color: #fff;
	border-radius: 8px;
	width: 90%;
	max-width: 500px;
	max-height: 80%;
	overflow: hidden;
}

.modal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px 20px;
	border-bottom: 1px solid #f0f0f0;
}

.modal-title {
	font-size: 16px;
	font-weight: bold;
}

.close-button {
	background: none;
	border: none;
	font-size: 20px;
	color: #999;
	padding: 0;
	width: 30px;
	height: 30px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.modal-body {
	padding: 20px;
}

.form-item {
	margin-bottom: 15px;
}

.label {
	display: block;
	margin-bottom: 5px;
	font-size: 14px;
	color: #333;
}

.input {
	width: 100%;
	padding: 12px 15px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 16px;
	box-sizing: border-box;
	height: 40px;
	padding: 8px 12px;
	font-size: 16px;
	border: 1px solid #ddd;
	border-radius: 4px;
	box-sizing: border-box;
	}
	
	.supplement-text {
		color: red;
		font-weight: bold;
	}


.days-input-container {
	display: flex;
	align-items: center;
	gap: 8px;
}

.days-button {
	width: 35px;
	height: 35px;
	border-radius: 50%;
	background-color: #007AFF;
	color: white;
	border: none;
	font-size: 16px;
	font-weight: bold;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0;
	flex-shrink: 0;
}

.days-button:disabled {
	background-color: #ccc;
	color: #999;
}

.days-input {
	flex: 1;
	min-width: 80px;
	padding: 8px 12px;
	border: 1px solid #ddd;
	border-radius: 4px;
	font-size: 14px;
	box-sizing: border-box;
	text-align: center;
	height: 35px;
}

.modal-footer {
	display: flex;
	gap: 10px;
	padding: 15px 20px;
	border-top: 1px solid #f0f0f0;
}

.cancel-button {
	flex: 1;
	margin: 0;
	background-color: #f5f5f5;
	color: #666;
}

.save-button {
	flex: 1;
	margin: 0;
}

.message {
	text-align: center;
	margin-top: 20px;
}

.message-text {
	font-size: 14px;
}

.success {
	color: #67C23A;
}

.error {
	color: #F56C6C;
}
</style>
