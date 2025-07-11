<template>
	<view>
		<input 
			type="number"
			v-model="pricePerDay"
			class="input-box"
			placeholder="请输入今日工资"
			style="
				width: 80%;
				height: 40px;
				margin: 10px auto;
				padding: 0 10px;
				border: 1px solid #dcdfe6;
				border-radius: 4px;
				font-size: 14px;
				color: #606266;
				background-color: #fff;
				box-sizing: border-box;
				display: block;
			"
		/>
	</view>

	<view>
		<input 
			type="text"
			v-model="remark"
			class="input-box"
			placeholder="请输入备注（可选）"
			style="
				width: 80%;
				height: 40px;
				margin: 10px auto;
				padding: 0 10px;
				border: 1px solid #dcdfe6;
				border-radius: 4px;
				font-size: 14px;
				color: #606266;
				background-color: #fff;
				box-sizing: border-box;
				display: block;
			"
		/>
	</view>
	
	<view class="counter-container" style="text-align: center; margin-top: 20px;">
		<text style="display: block; margin-bottom: 10px; font-size: 16px;">人数: {{ days }}</text>
		<button type="button" @click="decreaseDays" style="margin: 5px;">减少一人</button>
		<button type="button" @click="increaseDays" style="margin: 5px;">增加一人</button>
	</view>
	
	<view class="total-price" style="text-align: center; margin-top: 20px; font-weight: bold;">
		<text style="font-size: 18px;">合计: {{ totalPrice }}元</text>
	</view>
	
	<view style="margin-top: 30px; text-align: center;">
		<button type="primary" @click="saveData" style="width: 120px; height: 120px; border-radius: 50%; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; line-height: 1.2;">保存记录</button>
		<button type="default" @click="clearData" style="width: 80%; margin-top: 15px; background-color: #f56c6c; color: white;">清除所选</button>
		<text v-if="saveMessage" style="display: block; margin-top: 10px; color: #67C23A; font-size: 14px;">{{ saveMessage }}</text>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				days: 1, 
				pricePerDay: '', // 每天租金，初始为空字符串而不是0
				remark: '', // 备注信息
				saveMessage: '' // 保存成功的消息
			}
		},
		computed: {
			// 计算总租金
			totalPrice() {
				// 如果每日租金为空，则显示为0
				const price = this.pricePerDay === '' ? 0 : this.pricePerDay;
				return (price * this.days).toFixed(2);
			}
		},
		onLoad() {
			// 页面加载时检查是否被用户清除过，如果没有则加载上次数据
			this.loadDataIfNotCleared();
		},
		// onShow() {
			// 注释掉页面显示时的数据加载，避免清空表单后重新填充
			// this.loadData();
		// },
		onHide() {
			// 页面隐藏时自动保存数据，确保切换到数据管理页面时数据同步
			this.autoSaveData();
		},
		onUnload() {
			// 页面卸载时自动保存数据
			this.autoSaveData();
		},
		methods: {
			// 减少租用天数的方法
			decreaseDays() {
				if (this.days > 1) { // 确保天数不小于1
					this.days--;
				}
			},
			// 增加租用天数的方法
			increaseDays() {
				this.days++;
			},
			// 自动保存数据到本地存储（无提示）
			autoSaveData() {
				// 如果每日租金为空，不进行自动保存
				if (this.pricePerDay === '') {
					return;
				}
				
				uni.setStorage({
					key: 'rentalData',
					data: {
						days: this.days,
						pricePerDay: this.pricePerDay,
						remark: this.remark
					}
				});
			},
			// 保存数据到本地存储（有提示和历史记录）
			saveData() {
				// 检查每日租金是否已填写
				if (this.pricePerDay === '') {
					uni.showToast({
						title: '请输入每日租金',
						icon: 'none'
					});
					return;
				}
				
				// 保存当前数据
				uni.setStorage({
					key: 'rentalData',
					data: {
						days: this.days,
						pricePerDay: this.pricePerDay,
						remark: this.remark
					},
					success: () => {
						// 清除清空标记，因为用户已经保存了新数据
						uni.removeStorage({
							key: 'formCleared'
						});
						
						this.saveMessage = '数据保存成功！';
						// 3秒后清除消息
						setTimeout(() => {
							this.saveMessage = '';
						}, 3000);
						
						// 添加到历史记录
						this.addToHistory();
					}
				});
			},
			// 从本地存储加载数据
			loadData() {
				uni.getStorage({
					key: 'rentalData',
					success: (res) => {
						if (res.data) {
						this.days = res.data.days;
						this.pricePerDay = res.data.pricePerDay;
						this.remark = res.data.remark || '';
					}
					}
				});
			},
			// 智能加载数据：检查是否被用户清除过
			loadDataIfNotCleared() {
				uni.getStorage({
					key: 'formCleared',
					success: (res) => {
						if (!res.data) {
							// 如果没有清除标记，则加载上次数据
							this.loadData();
						}
						// 如果有清除标记，保持表单为空白状态
					},
					fail: () => {
						// 如果没有清除标记记录，说明是首次使用或从未清除过，加载数据
						this.loadData();
					}
				});
			},
			// 一键清除数据
			clearData() {
				// 恢复默认值（仅清除表单输入，不删除本地存储数据）
				this.days = 1;
				this.pricePerDay = '';
				this.remark = '';
				this.saveMessage = '';
				
				// 设置清除标记，表示用户主动清除了表单
				uni.setStorage({
					key: 'formCleared',
					data: true
				});
				
				uni.showToast({
					title: '表单已清空',
					icon: 'success'
				});
			},
			// 添加当前数据到历史记录
			addToHistory() {
				// 获取当前日期时间
				const now = new Date();
				const dateStr = now.getFullYear() + '-' + 
							(now.getMonth() + 1).toString().padStart(2, '0') + '-' + 
							now.getDate().toString().padStart(2, '0') + ' ' + 
							now.getHours().toString().padStart(2, '0') + ':' + 
							now.getMinutes().toString().padStart(2, '0');
				
				// 创建记录对象
				const record = {
					date: dateStr,
					days: this.days,
					pricePerDay: this.pricePerDay,
					totalPrice: this.totalPrice,
					remark: this.remark
				};
				
				// 获取现有历史记录
				uni.getStorage({
					key: 'historyRecords',
					success: (res) => {
						let historyRecords = res.data || [];
						
						// 添加到历史记录数组
						historyRecords.unshift(record); // 添加到数组开头
						
						// 限制历史记录最多保存10条
						if (historyRecords.length > 10) {
							historyRecords = historyRecords.slice(0, 10);
						}
						
						// 保存历史记录到本地存储
						uni.setStorage({
							key: 'historyRecords',
							data: historyRecords
						});
					},
					fail: () => {
						// 如果没有历史记录，创建新的
						uni.setStorage({
							key: 'historyRecords',
							data: [record]
						});
					}
				});
			}
		}
	}
</script>

<style>

</style>
