/**
 * 温度模拟器 - 主JavaScript文件
 * 功能：温度数据模拟、图表绘制和警告级别颜色逻辑
 * 版本：1.0.0
 */

// 配置常量
const CONFIG = {
    // 图表配置
    CHART: {
        WIDTH: 800,
        HEIGHT: 400,
        PADDING: { TOP: 20, RIGHT: 80, BOTTOM: 50, LEFT: 60 },
        POINT_RADIUS: 4,
        LINE_WIDTH: 2
    },
    
    // 温度阈值配置
    TEMPERATURE: {
        MIN: 10,       // 最小温度
        MAX: 50,       // 最大温度
        SAFE_MAX: 30,      // 安全温度上限
        WARNING_MAX: 35,   // 警告温度上限
        DANGER_MIN: 35     // 危险温度下限
    },
    
    // 颜色配置
    COLORS: {
        NORMAL: '#4CAF50',    // 绿色 - 正常温度
        WARNING: '#FFC107',   // 黄色 - 警告温度
        DANGER: '#F44336',    // 红色 - 危险温度
        GRID: '#E0E0E0',
        AXIS: '#333333',
        TEXT: '#666666',
        BACKGROUND: '#FFFFFF'
    },
    
    // 模拟数据配置
    SIMULATION: {
        DATA_POINTS: 50,      // 数据点数量
        UPDATE_INTERVAL: 2000, // 更新间隔(毫秒)
        TEMP_VARIATION: 4     // 温度波动范围
    }
};

// 全局变量
let temperatureData = [];
let chartInterval = null;
let currentTemperature = 20; // 初始温度

/**
 * 初始化应用程序
 */
function initApp() {
    try {
        console.log('正在初始化温度模拟器...');
        
        // 检查必要的DOM元素
        const canvas = document.getElementById('temperatureChart');
        if (!canvas) {
            throw new Error('找不到图表容器元素');
        }
        
        // 设置canvas尺寸
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;
        
        // 生成初始数据
        generateInitialData();
        
        // 绘制初始图表
        drawChart();
        
        // 更新温度显示
        updateTemperatureDisplay();
        
        // 启动数据更新
        startDataUpdate();
        
        // 添加窗口大小调整监听
        window.addEventListener('resize', handleResize);
        
        // 添加按钮事件监听
        setupEventListeners();
        
        // 更新当前日期
        updateCurrentDate();
        
        console.log('温度模拟器初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
        displayError('应用程序初始化失败: ' + error.message);
    }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startDataUpdate();
            console.log('开始模拟');
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            stopDataUpdate();
            console.log('暂停模拟');
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetSimulation();
            console.log('重置数据');
        });
    }
}

/**
 * 更新当前日期显示
 */
function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        dateElement.textContent = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

/**
 * 生成初始温度数据
 */
function generateInitialData() {
    temperatureData = [];
    // 随机起始温度，在20-28之间，属于正常范围
    let baseTemp = 20 + Math.random() * 8;
    
    for (let i = 0; i < CONFIG.SIMULATION.DATA_POINTS; i++) {
        // 模拟温度波动
        const fluctuation = (Math.random() - 0.5) * CONFIG.SIMULATION.TEMP_VARIATION;
        const temp = baseTemp + fluctuation;
        
        temperatureData.push({
            index: i,
            temperature: Math.max(CONFIG.TEMPERATURE.MIN, 
                                 Math.min(CONFIG.TEMPERATURE.MAX, temp)),
            timestamp: new Date(Date.now() - (CONFIG.SIMULATION.DATA_POINTS - i) * 1000)
        });
    }
    
    currentTemperature = temperatureData[temperatureData.length - 1].temperature;
}

/**
 * 更新温度数据
 */
function updateTemperatureData() {
    try {
        // 生成新温度：在当前温度±10度范围内随机
        // 如果当前温度>35度，70%概率下降
        let newTemp;
        
        if (currentTemperature > 35) {
            // 超过35度，70%概率下降，30%概率上升或平稳
            const rand = Math.random();
            if (rand < 0.7) {
                // 下降：当前温度减去0-10度之间的随机值
                newTemp = currentTemperature - (Math.random() * 10);
            } else {
                // 上升或平稳：±5度范围内
                newTemp = currentTemperature + (Math.random() - 0.5) * 10;
            }
        } else {
            // 正常情况：在±10度范围内随机
            newTemp = currentTemperature + (Math.random() - 0.5) * 20;
        }
        
        // 限制温度在10-50度范围内
        const clampedTemp = Math.max(CONFIG.TEMPERATURE.MIN, 
                                    Math.min(CONFIG.TEMPERATURE.MAX, newTemp));
        
        // 获取下一个index（保持递增，实现滚动效果）
        const nextIndex = temperatureData.length > 0 
            ? temperatureData[temperatureData.length - 1].index + 1 
            : 0;
        
        // 添加新数据点
        temperatureData.push({
            index: nextIndex,
            temperature: clampedTemp,
            timestamp: new Date()
        });
        
        // 移除最旧的数据点（保持固定数量）
        if (temperatureData.length > CONFIG.SIMULATION.DATA_POINTS) {
            temperatureData.shift();
        }
        
        // 更新当前温度
        currentTemperature = clampedTemp;
        
        // 更新图表
        drawChart();
        
        // 更新温度显示
        updateTemperatureDisplay();
        
    } catch (error) {
        console.error('更新温度数据失败:', error);
    }
}

/**
 * 根据温度获取对应的颜色
 * @param {number} temperature - 温度值
 * @returns {string} 颜色代码
 */
function getTemperatureColor(temperature) {
    if (temperature > CONFIG.TEMPERATURE.DANGER_MIN) {
        return CONFIG.COLORS.DANGER;  // 红色：>35°C
    } else if (temperature >= CONFIG.TEMPERATURE.SAFE_MAX) {
        return CONFIG.COLORS.WARNING;  // 黄色：30-35°C
    } else {
        return CONFIG.COLORS.NORMAL;   // 绿色：<30°C
    }
}

/**
 * 获取温度状态描述
 * @param {number} temperature - 温度值
 * @returns {string} 状态描述
 */
function getTemperatureStatus(temperature) {
    if (temperature > CONFIG.TEMPERATURE.DANGER_MIN) {
        return '危险';
    } else if (temperature >= CONFIG.TEMPERATURE.SAFE_MAX) {
        return '警告';
    } else {
        return '正常';
    }
}

/**
 * 绘制温度图表
 */
function drawChart() {
    try {
        const canvas = document.getElementById('temperatureChart');
        if (!canvas) {
            throw new Error('找不到图表画布');
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('无法获取2D绘图上下文');
        }
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 计算实际绘图区域
        const chartArea = {
            x: CONFIG.CHART.PADDING.LEFT,
            y: CONFIG.CHART.PADDING.TOP,
            width: canvas.width - CONFIG.CHART.PADDING.LEFT - CONFIG.CHART.PADDING.RIGHT,
            height: canvas.height - CONFIG.CHART.PADDING.TOP - CONFIG.CHART.PADDING.BOTTOM
        };
        
        // 绘制背景
        drawBackground(ctx, canvas);
        
        // 绘制网格
        drawGrid(ctx, chartArea);
        
        // 绘制坐标轴
        drawAxes(ctx, chartArea);
        
        // 绘制温度曲线
        drawTemperatureCurve(ctx, chartArea);
        
        // 绘制图例
        drawLegend(ctx, canvas);
        
    } catch (error) {
        console.error('绘制图表失败:', error);
    }
}

/**
 * 绘制背景
 */
function drawBackground(ctx, canvas) {
    ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制网格
 */
function drawGrid(ctx, chartArea) {
    ctx.strokeStyle = CONFIG.COLORS.GRID;
    ctx.lineWidth = 0.5;
    
    // 水平网格线
    const horizontalLines = 5;
    for (let i = 0; i <= horizontalLines; i++) {
        const y = chartArea.y + (i / horizontalLines) * chartArea.height;
        
        ctx.beginPath();
        ctx.moveTo(chartArea.x, y);
        ctx.lineTo(chartArea.x + chartArea.width, y);
        ctx.stroke();
    }
    
    // 垂直网格线
    const verticalLines = 10;
    for (let i = 0; i <= verticalLines; i++) {
        const x = chartArea.x + (i / verticalLines) * chartArea.width;
        
        ctx.beginPath();
        ctx.moveTo(x, chartArea.y);
        ctx.lineTo(x, chartArea.y + chartArea.height);
        ctx.stroke();
    }
}

/**
 * 绘制坐标轴
 */
function drawAxes(ctx, chartArea) {
    ctx.strokeStyle = CONFIG.COLORS.AXIS;
    ctx.lineWidth = 1;
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(chartArea.x, chartArea.y + chartArea.height);
    ctx.lineTo(chartArea.x + chartArea.width, chartArea.y + chartArea.height);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(chartArea.x, chartArea.y);
    ctx.lineTo(chartArea.x, chartArea.y + chartArea.height);
    ctx.stroke();
    
    // X轴标签 - 显示最新的几个时间点
    const xLabels = Math.min(5, temperatureData.length);
    const step = Math.max(1, Math.floor(temperatureData.length / xLabels));
    
    for (let i = 0; i < temperatureData.length; i += step) {
        const dataPoint = temperatureData[i];
        const minIndex = temperatureData[0].index;
        const maxIndex = temperatureData[temperatureData.length - 1].index;
        const indexRange = Math.max(maxIndex - minIndex, CONFIG.SIMULATION.DATA_POINTS - 1);
        const x = chartArea.x + ((dataPoint.index - minIndex) / indexRange) * chartArea.width;
        
        const time = dataPoint.timestamp;
        const label = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
        
        ctx.fillText(label, x, chartArea.y + chartArea.height + 10);
    }
    
    // 确保显示最后一个点的时间
    if (temperatureData.length > 0) {
        const lastPoint = temperatureData[temperatureData.length - 1];
        const minIndex = temperatureData[0].index;
        const maxIndex = temperatureData[temperatureData.length - 1].index;
        const indexRange = Math.max(maxIndex - minIndex, CONFIG.SIMULATION.DATA_POINTS - 1);
        const x = chartArea.x + ((lastPoint.index - minIndex) / indexRange) * chartArea.width;
        
        const time = lastPoint.timestamp;
        const label = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
        
        ctx.fillText(label, x, chartArea.y + chartArea.height + 10);
    }
    
    // Y轴标签 - 固定显示10, 20, 30, 40, 50度
    const yLabels = [10, 20, 30, 40, 50];
    yLabels.forEach(temp => {
        const normalized = (temp - CONFIG.TEMPERATURE.MIN) / 
                          (CONFIG.TEMPERATURE.MAX - CONFIG.TEMPERATURE.MIN);
        const y = chartArea.y + chartArea.height - (normalized * chartArea.height);
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${temp}°C`, chartArea.x - 10, y);
    });
    
    // 坐标轴标题
    ctx.textAlign = 'center';
    ctx.font = '14px Arial';
    ctx.fillText('时间', chartArea.x + chartArea.width / 2, chartArea.y + chartArea.height + 30);
    
    ctx.save();
    ctx.translate(20, chartArea.y + chartArea.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('温度 (°C)', 0, 0);
    ctx.restore();
}

/**
 * 绘制温度曲线
 */
function drawTemperatureCurve(ctx, chartArea) {
    if (temperatureData.length < 2) return;
    
    // 计算温度到Y坐标的映射
    const tempToY = (temp) => {
        const normalized = (temp - CONFIG.TEMPERATURE.MIN) / 
                          (CONFIG.TEMPERATURE.MAX - CONFIG.TEMPERATURE.MIN);
        return chartArea.y + chartArea.height - (normalized * chartArea.height);
    };
    
    // 计算索引到X坐标的映射（基于实际索引值，实现滚动效果）
    const minIndex = temperatureData[0].index;
    const maxIndex = temperatureData[temperatureData.length - 1].index;
    const indexRange = Math.max(maxIndex - minIndex, CONFIG.SIMULATION.DATA_POINTS - 1);
    
    const indexToX = (index) => {
        const normalized = (index - minIndex) / indexRange;
        return chartArea.x + normalized * chartArea.width;
    };
    
    // 绘制温度曲线 - 使用平滑曲线
    ctx.beginPath();
    ctx.lineWidth = CONFIG.CHART.LINE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // 移动到第一个点
    const firstPoint = temperatureData[0];
    ctx.moveTo(indexToX(firstPoint.index), tempToY(firstPoint.temperature));
    
    // 使用二次贝塞尔曲线绘制平滑曲线
    for (let i = 1; i < temperatureData.length; i++) {
        const point = temperatureData[i];
        const prevPoint = temperatureData[i - 1];
        
        // 计算控制点（前一个点和当前点的中点）
        const cpX = (indexToX(prevPoint.index) + indexToX(point.index)) / 2;
        const cpY = (tempToY(prevPoint.temperature) + tempToY(point.temperature)) / 2;
        
        // 使用二次贝塞尔曲线
        ctx.quadraticCurveTo(
            indexToX(prevPoint.index), 
            tempToY(prevPoint.temperature),
            cpX,
            cpY
        );
    }
    
    // 绘制到最后一个点
    const lastPoint = temperatureData[temperatureData.length - 1];
    ctx.lineTo(indexToX(lastPoint.index), tempToY(lastPoint.temperature));
    
    // 设置曲线颜色为当前温度对应的颜色
    ctx.strokeStyle = getTemperatureColor(currentTemperature);
    ctx.stroke();
    
    // 绘制最后一个点的特殊标记和温度标签
    const x = indexToX(lastPoint.index);
    const y = tempToY(lastPoint.temperature);
    
    // 绘制当前温度点的特殊标记
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.CHART.POINT_RADIUS * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = getTemperatureColor(lastPoint.temperature);
    ctx.fill();
    ctx.strokeStyle = getTemperatureColor(lastPoint.temperature);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 显示当前温度值 - 放在图表外侧右边
    const tempText = `${lastPoint.temperature.toFixed(1)}°C`;
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    
    // 将标签放在图表区域的右侧外面
    const textX = chartArea.x + chartArea.width + 10;
    const textY = y - 10;
    
    // 绘制文字（无背景）
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(tempText, textX, textY);
}

/**
 * 绘制图例
 */
function drawLegend(ctx, canvas) {
    const legendX = canvas.width - 200;
    const legendY = 20;
    const itemHeight = 25;
    const colorWidth = 20;
    
    const legendItems = [
        { label: '安全 (<30°C)', color: CONFIG.COLORS.NORMAL },
        { label: '警告 (30-35°C)', color: CONFIG.COLORS.WARNING },
        { label: '危险 (>35°C)', color: CONFIG.COLORS.DANGER }
    ];
    
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    legendItems.forEach((item, index) => {
        const y = legendY + index * itemHeight;
        
        // 绘制颜色方块
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, y, colorWidth, colorWidth - 5);
        
        // 绘制标签
        ctx.fillStyle = CONFIG.COLORS.TEXT;
        ctx.fillText(item.label, legendX + colorWidth + 10, y + (colorWidth - 5) / 2);
    });
}

/**
 * 更新温度显示
 */
function updateTemperatureDisplay() {
    try {
        const tempElement = document.getElementById('currentTemperature');
        const statusElement = document.getElementById('temperatureStatus');
        
        if (tempElement && statusElement) {
            const tempValue = currentTemperature.toFixed(1);
            console.log('更新温度显示:', tempValue + '°C');
            // 使用最简单的方式显示
            tempElement.textContent = tempValue + '°C';
            tempElement.style.color = getTemperatureColor(currentTemperature);
            
            const status = getTemperatureStatus(currentTemperature);
            statusElement.textContent = status;
            statusElement.style.color = getTemperatureColor(currentTemperature);
            
            // 更新状态指示器
            updateStatusIndicator(status);
        }
    } catch (error) {
        console.error('更新温度显示失败:', error);
    }
}

/**
 * 更新状态指示器
 */
function updateStatusIndicator(status) {
    const indicator = document.getElementById('statusIndicator');
    if (!indicator) return;
    
    indicator.textContent = status;
    
    switch (status) {
        case '危险':
            indicator.className = 'status-indicator danger';
            break;
        case '高温警告':
        case '低温警告':
            indicator.className = 'status-indicator warning';
            break;
        default:
            indicator.className = 'status-indicator normal';
    }
}

/**
 * 开始数据更新
 */
function startDataUpdate() {
    if (chartInterval) {
        clearInterval(chartInterval);
    }
    
    chartInterval = setInterval(() => {
        updateTemperatureData();
    }, CONFIG.SIMULATION.UPDATE_INTERVAL);
}

/**
 * 停止数据更新
 */
function stopDataUpdate() {
    if (chartInterval) {
        clearInterval(chartInterval);
        chartInterval = null;
    }
}

/**
 * 处理窗口大小调整
 */
function handleResize() {
    const canvas = document.getElementById('temperatureChart');
    if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = 400;
        drawChart();
    }
}

/**
 * 显示错误信息
 */
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #F44336;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // 3秒后移除错误信息
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}

/**
 * 重置模拟数据
 */
function resetSimulation() {
    try {
        stopDataUpdate();
        generateInitialData();
        drawChart();
        updateTemperatureDisplay();
        startDataUpdate();
    } catch (error) {
        console.error('重置模拟失败:', error);
        displayError('重置失败: ' + error.message);
    }
}

// 页面加载完成后初始化应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}