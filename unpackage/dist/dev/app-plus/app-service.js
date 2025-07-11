if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$3 = {
    data() {
      return {
        days: 1,
        pricePerDay: "",
        // 每天租金，初始为空字符串而不是0
        remark: "",
        // 备注信息
        saveMessage: ""
        // 保存成功的消息
      };
    },
    computed: {
      // 计算总租金
      totalPrice() {
        const price = this.pricePerDay === "" ? 0 : this.pricePerDay;
        return (price * this.days).toFixed(2);
      }
    },
    onLoad() {
      this.loadDataIfNotCleared();
    },
    // onShow() {
    // 注释掉页面显示时的数据加载，避免清空表单后重新填充
    // this.loadData();
    // },
    onHide() {
      this.autoSaveData();
    },
    onUnload() {
      this.autoSaveData();
    },
    methods: {
      // 减少租用天数的方法
      decreaseDays() {
        if (this.days > 1) {
          this.days--;
        }
      },
      // 增加租用天数的方法
      increaseDays() {
        this.days++;
      },
      // 自动保存数据到本地存储（无提示）
      autoSaveData() {
        if (this.pricePerDay === "") {
          return;
        }
        uni.setStorage({
          key: "rentalData",
          data: {
            days: this.days,
            pricePerDay: this.pricePerDay,
            remark: this.remark
          }
        });
      },
      // 保存数据到本地存储（有提示和历史记录）
      saveData() {
        if (this.pricePerDay === "") {
          uni.showToast({
            title: "请输入每日租金",
            icon: "none"
          });
          return;
        }
        uni.setStorage({
          key: "rentalData",
          data: {
            days: this.days,
            pricePerDay: this.pricePerDay,
            remark: this.remark
          },
          success: () => {
            uni.removeStorage({
              key: "formCleared"
            });
            this.saveMessage = "数据保存成功！";
            setTimeout(() => {
              this.saveMessage = "";
            }, 3e3);
            this.addToHistory();
          }
        });
      },
      // 从本地存储加载数据
      loadData() {
        uni.getStorage({
          key: "rentalData",
          success: (res) => {
            if (res.data) {
              this.days = res.data.days;
              this.pricePerDay = res.data.pricePerDay;
              this.remark = res.data.remark || "";
            }
          }
        });
      },
      // 智能加载数据：检查是否被用户清除过
      loadDataIfNotCleared() {
        uni.getStorage({
          key: "formCleared",
          success: (res) => {
            if (!res.data) {
              this.loadData();
            }
          },
          fail: () => {
            this.loadData();
          }
        });
      },
      // 一键清除数据
      clearData() {
        this.days = 1;
        this.pricePerDay = "";
        this.remark = "";
        this.saveMessage = "";
        uni.setStorage({
          key: "formCleared",
          data: true
        });
        uni.showToast({
          title: "表单已清空",
          icon: "success"
        });
      },
      // 添加当前数据到历史记录
      addToHistory() {
        const now = /* @__PURE__ */ new Date();
        const dateStr = now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0") + " " + now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
        const record = {
          date: dateStr,
          days: this.days,
          pricePerDay: this.pricePerDay,
          totalPrice: this.totalPrice,
          remark: this.remark
        };
        uni.getStorage({
          key: "historyRecords",
          success: (res) => {
            let historyRecords = res.data || [];
            historyRecords.unshift(record);
            if (historyRecords.length > 10) {
              historyRecords = historyRecords.slice(0, 10);
            }
            uni.setStorage({
              key: "historyRecords",
              data: historyRecords
            });
          },
          fail: () => {
            uni.setStorage({
              key: "historyRecords",
              data: [record]
            });
          }
        });
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock(
      vue.Fragment,
      null,
      [
        vue.createElementVNode("view", null, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "number",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.pricePerDay = $event),
              class: "input-box",
              placeholder: "请输入今日工资",
              style: { "width": "80%", "height": "40px", "margin": "10px auto", "padding": "0 10px", "border": "1px solid #dcdfe6", "border-radius": "4px", "font-size": "14px", "color": "#606266", "background-color": "#fff", "box-sizing": "border-box", "display": "block" }
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.pricePerDay]
          ])
        ]),
        vue.createElementVNode("view", null, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.remark = $event),
              class: "input-box",
              placeholder: "请输入备注（可选）",
              style: { "width": "80%", "height": "40px", "margin": "10px auto", "padding": "0 10px", "border": "1px solid #dcdfe6", "border-radius": "4px", "font-size": "14px", "color": "#606266", "background-color": "#fff", "box-sizing": "border-box", "display": "block" }
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.remark]
          ])
        ]),
        vue.createElementVNode("view", {
          class: "counter-container",
          style: { "text-align": "center", "margin-top": "20px" }
        }, [
          vue.createElementVNode(
            "text",
            { style: { "display": "block", "margin-bottom": "10px", "font-size": "16px" } },
            "人数: " + vue.toDisplayString($data.days),
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            type: "button",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.decreaseDays && $options.decreaseDays(...args)),
            style: { "margin": "5px" }
          }, "减少一人"),
          vue.createElementVNode("button", {
            type: "button",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.increaseDays && $options.increaseDays(...args)),
            style: { "margin": "5px" }
          }, "增加一人")
        ]),
        vue.createElementVNode("view", {
          class: "total-price",
          style: { "text-align": "center", "margin-top": "20px", "font-weight": "bold" }
        }, [
          vue.createElementVNode(
            "text",
            { style: { "font-size": "18px" } },
            "合计: " + vue.toDisplayString($options.totalPrice) + "元",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { style: { "margin-top": "30px", "text-align": "center" } }, [
          vue.createElementVNode("button", {
            type: "primary",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.saveData && $options.saveData(...args)),
            style: { "width": "120px", "height": "120px", "border-radius": "50%", "font-size": "16px", "display": "inline-flex", "align-items": "center", "justify-content": "center", "line-height": "1.2" }
          }, "保存记录"),
          vue.createElementVNode("button", {
            type: "default",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.clearData && $options.clearData(...args)),
            style: { "width": "80%", "margin-top": "15px", "background-color": "#f56c6c", "color": "white" }
          }, "清除所选"),
          $data.saveMessage ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              style: { "display": "block", "margin-top": "10px", "color": "#67C23A", "font-size": "14px" }
            },
            vue.toDisplayString($data.saveMessage),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ])
      ],
      64
      /* STABLE_FRAGMENT */
    );
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "/Users/jj/Documents/MyCode/HBuilderX/PaymentSettlementSystem/pages/index/index.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        days: 1,
        // 默认租用天数为1天
        pricePerDay: "",
        // 每天租金，初始为空字符串而不是0
        historyRecords: [],
        // 历史记录数组
        currentYear: (/* @__PURE__ */ new Date()).getFullYear()
        // 当前查看的年份
      };
    },
    computed: {
      // 计算总租金
      totalPrice() {
        const price = this.pricePerDay === "" ? 0 : this.pricePerDay;
        return (price * this.days).toFixed(2);
      },
      // 获取当前年份的记录
      currentYearRecords() {
        return this.historyRecords.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === this.currentYear;
        });
      },
      // 月度统计数据
      monthlyStats() {
        const monthlyData = {};
        this.currentYearRecords.forEach((record) => {
          const recordDate = new Date(record.date);
          const month = recordDate.getMonth() + 1;
          const dateKey = recordDate.getFullYear() + "-" + month + "-" + recordDate.getDate();
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month,
              totalIncome: 0,
              workDates: /* @__PURE__ */ new Set()
            };
          }
          monthlyData[month].totalIncome += parseFloat(record.totalPrice || 0);
          monthlyData[month].workDates.add(dateKey);
        });
        const result = Object.values(monthlyData).map((data) => ({
          month: data.month,
          workDays: data.workDates.size,
          totalIncome: data.totalIncome.toFixed(2),
          avgDailyIncome: data.workDates.size > 0 ? (data.totalIncome / data.workDates.size).toFixed(2) : "0.00"
        }));
        return result.sort((a, b) => a.month - b.month);
      },
      // 图表数据
      chartData() {
        const months = [];
        for (let i = 1; i <= 12; i++) {
          months.push({
            month: i,
            income: 0
          });
        }
        this.currentYearRecords.forEach((record) => {
          const month = new Date(record.date).getMonth() + 1;
          months[month - 1].income += parseFloat(record.totalPrice || 0);
        });
        const totalIncome = months.reduce((sum, m) => sum + m.income, 0);
        return months.map((month) => ({
          ...month,
          income: month.income.toFixed(2),
          barWidth: totalIncome > 0 ? Math.round(month.income / totalIncome * 100) : 0
        }));
      },
      // 计算当前年份工作天数
      yearWorkDays() {
        const uniqueDates = /* @__PURE__ */ new Set();
        this.currentYearRecords.forEach((record) => {
          const recordDate = new Date(record.date);
          const dateKey = recordDate.getFullYear() + "-" + (recordDate.getMonth() + 1) + "-" + recordDate.getDate();
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
          return "0.00";
        }
        return (parseFloat(this.totalYearIncome) / this.yearWorkDays).toFixed(2);
      }
    },
    onLoad() {
      this.loadData();
      this.loadHistoryRecords();
    },
    onShow() {
      this.loadData();
      this.loadHistoryRecords();
    },
    methods: {
      // 从本地存储加载数据
      loadData() {
        uni.getStorage({
          key: "rentalData",
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
          key: "historyRecords",
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
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "year-navigation" }, [
          vue.createElementVNode("button", {
            class: "nav-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.previousYear && $options.previousYear(...args))
          }, "‹"),
          vue.createElementVNode(
            "text",
            { class: "year-title" },
            vue.toDisplayString($data.currentYear) + "年数据管理",
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            class: "nav-button",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.nextYear && $options.nextYear(...args))
          }, "›")
        ])
      ]),
      vue.createElementVNode("view", { class: "current-data" }, [
        vue.createElementVNode("view", { class: "data-item" }, [
          vue.createElementVNode(
            "text",
            { class: "label" },
            vue.toDisplayString($data.currentYear) + "年工作天数:",
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($options.yearWorkDays) + "天",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "data-item" }, [
          vue.createElementVNode("text", { class: "label" }, "每日平均工资:"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($options.averageDailyWage) + "元",
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "data-item" }, [
          vue.createElementVNode("text", { class: "label" }, "合计收入:"),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($options.totalYearIncome) + "元",
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "history-section" }, [
        vue.createElementVNode(
          "text",
          { class: "section-title" },
          vue.toDisplayString($data.currentYear) + "年月入统计",
          1
          /* TEXT */
        ),
        $options.monthlyStats.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-history"
        }, [
          vue.createElementVNode(
            "text",
            null,
            vue.toDisplayString($data.currentYear) + "年暂无收入记录",
            1
            /* TEXT */
          )
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "monthly-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.monthlyStats, (monthData, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "monthly-item"
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "month-title" },
                  vue.toDisplayString(monthData.month) + "月",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "monthly-details" }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    "工作天数: " + vue.toDisplayString(monthData.workDays) + "天",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    null,
                    "月收入: " + vue.toDisplayString(monthData.totalIncome) + "元",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    null,
                    "日均收入: " + vue.toDisplayString(monthData.avgDailyIncome) + "元",
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]))
      ]),
      vue.createCommentVNode(" 月入统计图 "),
      vue.createElementVNode("view", { class: "chart-section" }, [
        vue.createElementVNode(
          "view",
          { class: "chart-title" },
          vue.toDisplayString($data.currentYear) + "年月入统计图",
          1
          /* TEXT */
        ),
        vue.createElementVNode("view", { class: "chart-container" }, [
          vue.createElementVNode("view", { class: "chart-horizontal" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($options.chartData, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "horizontal-bar-item"
                }, [
                  vue.createElementVNode(
                    "view",
                    { class: "month-label-left" },
                    vue.toDisplayString(item.month) + "月",
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "bar-container" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "horizontal-bar",
                        style: vue.normalizeStyle({ width: item.barWidth + "%" })
                      },
                      null,
                      4
                      /* STYLE */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "bar-percentage" },
                      vue.toDisplayString(item.barWidth) + "%",
                      1
                      /* TEXT */
                    )
                  ])
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ])
    ]);
  }
  const PagesDateDate = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "/Users/jj/Documents/MyCode/HBuilderX/PaymentSettlementSystem/pages/date/date.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        weekdays: ["日", "一", "二", "三", "四", "五", "六"],
        currentYear: (/* @__PURE__ */ new Date()).getFullYear(),
        currentMonth: (/* @__PURE__ */ new Date()).getMonth(),
        selectedDay: 0,
        historyRecords: [],
        selectedDayRecords: [],
        message: "",
        messageType: "success",
        showEditModal: false,
        editingRecord: null,
        editingIndex: -1,
        editForm: {
          days: "",
          pricePerDay: "",
          remark: ""
        }
      };
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
        const monthRecords = this.historyRecords.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === this.currentYear && recordDate.getMonth() === this.currentMonth;
        });
        const uniqueDates = /* @__PURE__ */ new Set();
        monthRecords.forEach((record) => {
          const recordDate = new Date(record.date);
          const dateKey = recordDate.getDate();
          uniqueDates.add(dateKey);
        });
        return uniqueDates.size;
      },
      // 计算当月总收入
      monthTotalIncome() {
        const monthRecords = this.historyRecords.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === this.currentYear && recordDate.getMonth() === this.currentMonth;
        });
        return monthRecords.reduce((total, record) => total + parseFloat(record.totalPrice || 0), 0).toFixed(2);
      }
    },
    onLoad() {
      this.loadHistoryRecords();
    },
    onShow() {
      this.loadHistoryRecords();
      if (this.selectedDay > 0) {
        setTimeout(() => {
          this.selectDay(this.selectedDay);
        }, 100);
      }
    },
    methods: {
      // 加载历史记录
      loadHistoryRecords() {
        uni.getStorage({
          key: "historyRecords",
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
          key: "historyRecords",
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
        const today = /* @__PURE__ */ new Date();
        return this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth() && day === today.getDate();
      },
      // 判断某天是否有记录
      hasRecord(day) {
        return this.historyRecords.some((record) => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === this.currentYear && recordDate.getMonth() === this.currentMonth && recordDate.getDate() === day;
        });
      },
      // 选择某一天
      selectDay(day) {
        this.selectedDay = day;
        this.selectedDayRecords = this.historyRecords.filter((record) => {
          const recordDate = new Date(record.date);
          return recordDate.getFullYear() === this.currentYear && recordDate.getMonth() === this.currentMonth && recordDate.getDate() === day;
        });
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
          this.showMessage("请先选择日期", "error");
          return;
        }
        this.editingRecord = null;
        this.editingIndex = -1;
        this.editForm = {
          days: "1",
          pricePerDay: "",
          remark: ""
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
          remark: record.remark || ""
        };
        this.showEditModal = true;
      },
      // 删除记录
      deleteRecord(index) {
        uni.showModal({
          title: "确认删除",
          content: "确定要删除这条记录吗？",
          success: (res) => {
            if (res.confirm) {
              const recordToDelete = this.selectedDayRecords[index];
              const globalIndex = this.historyRecords.findIndex(
                (record) => record.date === recordToDelete.date && record.days === recordToDelete.days && record.pricePerDay === recordToDelete.pricePerDay
              );
              if (globalIndex !== -1) {
                this.historyRecords.splice(globalIndex, 1);
                this.saveHistoryRecords();
                this.selectDay(this.selectedDay);
                this.$forceUpdate();
                this.showMessage("记录已删除", "success");
              }
            }
          }
        });
      },
      // 保存记录
      saveRecord() {
        if (!this.editForm.days || !this.editForm.pricePerDay) {
          this.showMessage("请填写完整信息", "error");
          return;
        }
        const days = parseInt(this.editForm.days);
        const pricePerDay = parseFloat(this.editForm.pricePerDay);
        const totalPrice = days * pricePerDay;
        if (this.editingRecord) {
          const globalIndex = this.historyRecords.findIndex(
            (record) => record.date === this.editingRecord.date && record.days === this.editingRecord.days && record.pricePerDay === this.editingRecord.pricePerDay
          );
          if (globalIndex !== -1) {
            this.historyRecords[globalIndex] = {
              ...this.historyRecords[globalIndex],
              days,
              pricePerDay,
              totalPrice,
              remark: this.editForm.remark
            };
          }
        } else {
          const now = /* @__PURE__ */ new Date();
          const recordDate = new Date(this.currentYear, this.currentMonth, this.selectedDay, now.getHours(), now.getMinutes(), now.getSeconds());
          const newRecord = {
            date: recordDate.toISOString(),
            days,
            pricePerDay,
            totalPrice,
            remark: this.editForm.remark
          };
          this.historyRecords.push(newRecord);
        }
        this.saveHistoryRecords();
        this.selectDay(this.selectedDay);
        this.$forceUpdate();
        this.closeEditModal();
        this.showMessage(this.editingRecord ? "记录已更新" : "记录已添加", "success");
      },
      // 关闭编辑弹窗
      closeEditModal() {
        this.showEditModal = false;
        this.editingRecord = null;
        this.editingIndex = -1;
        this.editForm = {
          days: "",
          pricePerDay: "",
          remark: ""
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
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
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
        const now = /* @__PURE__ */ new Date();
        const recordDay = recordDate.getDate();
        const recordMonth = recordDate.getMonth();
        const recordYear = recordDate.getFullYear();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return !(recordYear === currentYear && recordMonth === currentMonth && recordDay === currentDay);
      },
      // 显示消息
      showMessage(msg, type = "success") {
        this.message = msg;
        this.messageType = type;
        setTimeout(() => {
          this.message = "";
        }, 3e3);
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "calendar-container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "工作日历")
      ]),
      vue.createCommentVNode(" 月度统计信息 "),
      vue.createElementVNode("view", { class: "month-stats" }, [
        vue.createElementVNode(
          "text",
          { class: "stats-text" },
          "本月工作天数：" + vue.toDisplayString($options.monthWorkDays) + "天",
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "text",
          { class: "stats-text" },
          "本月合计工资：" + vue.toDisplayString($options.monthTotalIncome) + "元",
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "calendar-controls" }, [
        vue.createElementVNode("button", {
          onClick: _cache[0] || (_cache[0] = (...args) => $options.prevMonth && $options.prevMonth(...args)),
          class: "nav-button"
        }, "上个月"),
        vue.createElementVNode(
          "text",
          { class: "current-month" },
          vue.toDisplayString($data.currentYear) + "年" + vue.toDisplayString($data.currentMonth + 1) + "月",
          1
          /* TEXT */
        ),
        vue.createElementVNode("button", {
          onClick: _cache[1] || (_cache[1] = (...args) => $options.nextMonth && $options.nextMonth(...args)),
          class: "nav-button"
        }, "下个月")
      ]),
      vue.createElementVNode("view", { class: "calendar" }, [
        vue.createCommentVNode(" 星期标题 "),
        vue.createElementVNode("view", { class: "weekdays" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.weekdays, (day, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: index,
                  class: "weekday"
                },
                vue.toDisplayString(day),
                1
                /* TEXT */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]),
        vue.createCommentVNode(" 日历格子 "),
        vue.createElementVNode("view", { class: "days" }, [
          vue.createCommentVNode(" 前导空白格子 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.firstDayOfMonth, (n) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: "empty-" + n,
                class: "day empty"
              });
            }),
            128
            /* KEYED_FRAGMENT */
          )),
          vue.createCommentVNode(" 日期格子 "),
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.daysInMonth, (day) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: day,
                class: vue.normalizeClass(["day", $options.isToday(day) ? "today" : "", $options.hasRecord(day) ? "has-record" : "", $data.selectedDay === day ? "selected" : ""]),
                onClick: ($event) => $options.selectDay(day),
                onLongpress: ($event) => $options.showDayMenu(day)
              }, [
                vue.createElementVNode(
                  "text",
                  null,
                  vue.toDisplayString(day),
                  1
                  /* TEXT */
                ),
                $options.hasRecord(day) ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "record-dot"
                })) : vue.createCommentVNode("v-if", true)
              ], 42, ["onClick", "onLongpress"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 选中日期的记录 "),
      $data.selectedDayRecords.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "day-records"
      }, [
        vue.createElementVNode("view", { class: "records-header" }, [
          vue.createElementVNode(
            "text",
            { class: "section-title" },
            vue.toDisplayString($data.currentYear) + "年" + vue.toDisplayString($data.currentMonth + 1) + "月" + vue.toDisplayString($data.selectedDay) + "日的记录",
            1
            /* TEXT */
          ),
          vue.createElementVNode("button", {
            onClick: _cache[2] || (_cache[2] = (...args) => $options.addRecord && $options.addRecord(...args)),
            class: "add-button",
            size: "mini",
            type: "primary"
          }, "新增记录")
        ]),
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.selectedDayRecords, (record, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "record-item"
            }, [
              vue.createElementVNode("rich-text", {
                class: "record-time",
                nodes: $options.formatTimeWithSupplement(record)
              }, null, 8, ["nodes"]),
              vue.createElementVNode("view", { class: "record-details" }, [
                vue.createElementVNode(
                  "text",
                  null,
                  "人数: " + vue.toDisplayString(record.days) + "人",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  null,
                  "每日工资: " + vue.toDisplayString(record.pricePerDay) + "元",
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  null,
                  "合计工资: " + vue.toDisplayString(record.totalPrice) + "元",
                  1
                  /* TEXT */
                ),
                record.remark ? (vue.openBlock(), vue.createElementBlock(
                  "text",
                  { key: 0 },
                  "备注: " + vue.toDisplayString(record.remark),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ]),
              vue.createElementVNode("view", { class: "record-actions" }, [
                vue.createElementVNode("button", {
                  type: "default",
                  size: "mini",
                  onClick: ($event) => $options.editRecord(record, index),
                  class: "action-button"
                }, "修改", 8, ["onClick"]),
                vue.createElementVNode("button", {
                  type: "warn",
                  size: "mini",
                  onClick: ($event) => $options.deleteRecord(index),
                  class: "action-button"
                }, "删除", 8, ["onClick"])
              ])
            ]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ])) : $data.selectedDay > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "no-records"
      }, [
        vue.createElementVNode(
          "text",
          null,
          vue.toDisplayString($data.currentYear) + "年" + vue.toDisplayString($data.currentMonth + 1) + "月" + vue.toDisplayString($data.selectedDay) + "日没有记录",
          1
          /* TEXT */
        ),
        vue.createElementVNode("button", {
          onClick: _cache[3] || (_cache[3] = (...args) => $options.addRecord && $options.addRecord(...args)),
          class: "add-button",
          size: "mini",
          type: "primary"
        }, "新增记录")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 编辑记录弹窗 "),
      $data.showEditModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "modal-overlay",
        onClick: _cache[13] || (_cache[13] = (...args) => $options.closeEditModal && $options.closeEditModal(...args))
      }, [
        vue.createElementVNode("view", {
          class: "modal-content",
          onClick: _cache[12] || (_cache[12] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode(
              "text",
              { class: "modal-title" },
              vue.toDisplayString($data.editingRecord ? "修改记录" : "新增记录"),
              1
              /* TEXT */
            ),
            vue.createElementVNode("button", {
              onClick: _cache[4] || (_cache[4] = (...args) => $options.closeEditModal && $options.closeEditModal(...args)),
              class: "close-button"
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "每日工资："),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.editForm.pricePerDay = $event),
                  type: "number",
                  class: "input",
                  placeholder: "请输入每日工资"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.editForm.pricePerDay]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "备注："),
              vue.withDirectives(vue.createElementVNode(
                "input",
                {
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => $data.editForm.remark = $event),
                  type: "text",
                  class: "input",
                  placeholder: "请输入备注（可选）"
                },
                null,
                512
                /* NEED_PATCH */
              ), [
                [vue.vModelText, $data.editForm.remark]
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("text", { class: "label" }, "人数："),
              vue.createElementVNode("view", { class: "days-input-container" }, [
                vue.createElementVNode("button", {
                  onClick: _cache[7] || (_cache[7] = (...args) => $options.decreaseDays && $options.decreaseDays(...args)),
                  class: "days-button",
                  disabled: $data.editForm.days <= 1
                }, "-", 8, ["disabled"]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => $data.editForm.days = $event),
                    type: "number",
                    class: "days-input",
                    placeholder: "请输入人数"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $data.editForm.days]
                ]),
                vue.createElementVNode("button", {
                  onClick: _cache[9] || (_cache[9] = (...args) => $options.increaseDays && $options.increaseDays(...args)),
                  class: "days-button"
                }, "+")
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("button", {
              onClick: _cache[10] || (_cache[10] = (...args) => $options.closeEditModal && $options.closeEditModal(...args)),
              class: "cancel-button"
            }, "取消"),
            vue.createElementVNode("button", {
              onClick: _cache[11] || (_cache[11] = (...args) => $options.saveRecord && $options.saveRecord(...args)),
              class: "save-button",
              type: "primary"
            }, "保存")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      $data.message ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "message"
      }, [
        vue.createElementVNode(
          "text",
          {
            class: vue.normalizeClass(["message-text", $data.messageType])
          },
          vue.toDisplayString($data.message),
          3
          /* TEXT, CLASS */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesCalendarCalendar = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "/Users/jj/Documents/MyCode/HBuilderX/PaymentSettlementSystem/pages/calendar/calendar.vue"]]);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/date/date", PagesDateDate);
  __definePage("pages/calendar/calendar", PagesCalendarCalendar);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "/Users/jj/Documents/MyCode/HBuilderX/PaymentSettlementSystem/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
