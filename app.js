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
        PADDING: { TOP: 20, RIGHT: 30, BOTTOM: 50, LEFT: 60 },
        POINT_RADIUS: 4,
        LINE_WIDTH: 2
    },
    
    // 温度阈值配置
    TEMPERATURE: {
        MIN: -10,      // 最小温度
        MAX: 50,       // 最大温度
        LOW_WARNING: 0,    // 低温警告阈值
        HIGH_WARNING: 35,  // 高温警告阈值
        CRITICAL: 40       // 危险温度阈值
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
        TEMP_VARIATION: 5     // 温度波动范围
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
        if (!document.getElementById('temperatureChart')) {
            throw new Error('找不到图表容器元素');
        }
        
        // 生成初始数据
        generateInitialData();
        
        // 绘制初始图表
        drawChart();
        
        // 启动数据更新
        startDataUpdate();
        
        // 添加窗口大小调整监听
        window.addEventListener('resize', handleResize);
        
        console.log('温度模拟器初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
        displayError('应用程序初始化失败: ' + error.message);
    }
}

/**
 * 生成初始温度数据
 */
function generateInitialData() {
    temperatureData = [];
    let baseTemp = 20;
    
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
        // 移除最旧的数据点
        temperatureData.shift();
        
        // 生成新的温度数据
        const fluctuation = (Math.random() - 0.5) * CONFIG.SIMULATION.TEMP_VARIATION;
        const newTemp = currentTemperature + fluctuation;
        
        // 限制温度在合理范围内
        const clampedTemp = Math.max(CONFIG.TEMPERATURE.MIN, 
                                    Math.min(CONFIG.TEMPERATURE.MAX, newTemp));
        
        // 添加新数据点
        temperatureData.push({
            index: temperatureData.length,
            temperature: clampedTemp,
            timestamp: new Date()
        });
        
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
    if (temperature >= CONFIG.TEMPERATURE.CRITICAL) {
        return CONFIG.COLORS.DANGER;
    } else if (temperature >= CONFIG.TEMPERATURE.HIGH_WARNING || 
               temperature <= CONFIG.TEMPERATURE.LOW_WARNING) {
        return CONFIG.COLORS.WARNING;
    } else {
        return CONFIG.COLORS.NORMAL;
    }
}

/**
 * 获取温度状态描述
 * @param {number} temperature - 温度值
 * @returns {string} 状态描述
 */
function getTemperatureStatus(temperature) {
    if (temperature >= CONFIG.TEMPERATURE.CRITICAL) {
        return '危险';
    } else if (temperature >= CONFIG.TEMPERATURE.HIGH_WARNING) {
        return '高温警告';
    } else if (temperature <= CONFIG.TEMPERATURE.LOW_WARNING) {
        return '低温警告';
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
    
    // X轴标签
    const xLabels = 5;
    for (let i = 0; i <= xLabels; i++) {
        const x = chartArea.x + (i / xLabels) * chartArea.width;
        const labelIndex = Math.floor((i / xLabels) * (temperatureData.length - 1));
        
        if (temperatureData[labelIndex]) {
            const time = temperatureData[labelIndex].timestamp;
            const label = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            
            ctx.fillText(label, x, chartArea.y + chartArea.height + 10);
        }
    }
    
    // Y轴标签
    const yLabels = 5;
    for (let i = 0; i <= yLabels; i++) {
        const y = chartArea.y + (i / yLabels) * chartArea.height;
        const temp = CONFIG.TEMPERATURE.MAX - (i / yLabels) * 
                    (CONFIG.TEMPERATURE.MAX - CONFIG.TEMPERATURE.MIN);
        
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${temp.toFixed(0)}°C`, chartArea.x - 10, y);
    }
    
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
    
    // 计算索引到X坐标的映射
    const indexToX = (index) => {
        const normalized = index / (temperatureData.length - 1);
        return chartArea.x + normalized * chartArea.width;
    };
    
    // 绘制温度曲线
    ctx.beginPath();
    ctx.lineWidth = CONFIG.CHART.LINE_WIDTH;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // 移动到第一个点
    const firstPoint = temperatureData[0];
    ctx.moveTo(indexToX(firstPoint.index), tempToY(firstPoint.temperature));
    
    // 绘制线段
    for (let i = 1; i < temperatureData.length; i++) {
        const point = temperatureData[i];
        ctx.lineTo(indexToX(point.index), tempToY(point.temperature));
    }
    
    // 设置曲线颜色为当前温度对应的颜色
    ctx.strokeStyle = getTemperatureColor(currentTemperature);
    ctx.stroke();
    
    // 绘制数据点
    for (let i = 0; i < temperatureData.length; i++) {
        const point = temperatureData[i];
        const x = indexToX(point.index);
        const y = tempToY(point.temperature);
        
        ctx.beginPath();
        ctx.arc(x, y, CONFIG.CHART.POINT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = getTemperatureColor(point.temperature);
        ctx.fill();
        
        // 绘制当前温度点的特殊标记
        if (i === temperatureData.length - 1) {
            ctx.beginPath();
            ctx.arc(x, y, CONFIG.CHART.POINT_RADIUS * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = getTemperatureColor(point.temperature);
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 显示当前温度值
            ctx.fillStyle = CONFIG.COLORS.TEXT;
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${point.temperature.toFixed(1)}°C`, x + 10, y - 10);
        }
    }
}

/**
 * 绘制图例
 */
function drawLegend(ctx, canvas) {
    const legendX = canvas.width - 200;
    const legendY = 20;
    const itemHeight = 20;
    const colorWidth = 20;
    
    const legendItems = [
        { label: '正常 (0-35°C)', color: CONFIG.COLORS.NORMAL },
        { label: '警告 (<0°C 或 >35°C)', color: CONFIG.COLORS.WARNING },
        { label: '危险 (>40°C)', color: CONFIG.COLORS.DANGER }
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
            tempElement.textContent = currentTemperature.toFixed(1);
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
    // 重新绘制图表
    drawChart();
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

/**
 * 导出温度数据为CSV
 */
function exportData() {
    try {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "时间,温度(°C),状态\n"
            + temperatureData.map(point => {
                const time = point.timestamp.toLocaleTimeString();
                const temp = point.temperature.toFixed(2);
                const status = getTemperatureStatus(point.temperature);
                return `${time},${temp},${status}`;
            }).join("\n");
        
        const encoded