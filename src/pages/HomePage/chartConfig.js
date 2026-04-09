import * as echarts from 'echarts';

export const mapConfig = {
  backgroundColor: '#F8F5F2',
  tooltip: {
    trigger: 'item',
    formatter: '{b}',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: '#9C706A',
    textStyle: { color: '#333' }
  },
  geo: {
    map: 'world',
    roam: true,
    zoom: 1.8,
    center: [110, 25],
    itemStyle: {
      areaColor: '#EAE3DC',
      borderColor: '#D3C4BE',
      borderWidth: 0.5
    },
    emphasis: {
      itemStyle: { areaColor: '#D8B29C' },
      label: { show: true, color: '#333', fontSize: 13 }
    },
    label: { show: false },
  },
  series: [
    {
      type: 'lines',
      coordinateSystem: 'geo',
      zlevel: 2,
      effect: {
        show: true,
        period: 3,
        symbolSize: 6,
        trailLength: 0.4,
        color: '#D39E7A',
      },
      lineStyle: {
        width: 1.8,
        opacity: 0.6,
        curveness: 0.2,
        color: { type: 'linear', x: 0, y: 0, x2: 1, y2: 0, colorStops: [{ offset: 0, color: '#9C706A' }, { offset: 1, color: '#D39E7A' }] }
      },
      data: [
        { coords: [[116.7,23.4],[100.5,13.7]] },
        { coords: [[116.7,23.4],[103.8,1.3]] },
        { coords: [[116.7,23.4],[101.7,3.1]] },
        { coords: [[116.7,23.4],[-74.0,40.7]] },
        { coords: [[116.6,23.6],[100.5,13.7]] },
        { coords: [[116.4,23.5],[101.7,3.1]] },
        { coords: [[116.1,24.3],[103.8,1.3]] },
        { coords: [[118.6,24.9],[103.8,1.3]] },
        { coords: [[119.3,26.1],[103.8,1.3]] },
        { coords: [[118.6,24.9],[108.2,14.1]] },
        { coords: [[118.1,24.5],[100.5,13.7]] },
        { coords: [[117.6,24.4],[101.7,3.1]] },
        { coords: [[121.5,29.9],[2.3,48.8]] },
        { coords: [[113.3,23.1],[-74.0,40.7]] },
        { coords: [[112.3,22.2],[103.8,1.3]] },
        { coords: [[110.3,21.3],[100.5,13.7]] },
        { coords: [[119.3,26.1],[-97.1,49.9]] },
        { coords: [[118.6,24.9],[133.5,-25.3]] },
        { coords: [[116.7,23.4],[106.8,-6.2]] }
      ]
    },
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 3,
      symbolSize: 6,
      rippleEffect: { scale: 2, brushType: 'stroke' },
      emphasis: { symbolSize: 16, rippleEffect: { scale: 6 } },
      label: { show: false },
      itemStyle: { color: '#D39E7A', shadowBlur: 10, shadowColor: '#9C706A' },
      data: [
        { name: '汕头', value: [116.7,23.4] },
        { name: '潮州', value: [116.6,23.6] },
        { name: '揭阳', value: [116.4,23.5] },
        { name: '梅州', value: [116.1,24.3] },
        { name: '福州', value: [119.3,26.1] },
        { name: '泉州', value: [118.6,24.9] },
        { name: '厦门', value: [118.1,24.5] },
        { name: '漳州', value: [117.6,24.4] },
        { name: '宁波', value: [121.5,29.9] },
        { name: '广州', value: [113.3,23.1] },
        { name: '江门', value: [112.3,22.2] },
        { name: '湛江', value: [110.3,21.3] },
        { name: '泰国', value: [100.5,13.7] },
        { name: '新加坡', value: [103.8,1.3] },
        { name: '马来西亚', value: [101.7,3.1] },
        { name: '越南', value: [108.2,14.1] },
        { name: '法国', value: [2.3,48.8] },
        { name: '美国', value: [-74.0,40.7] },
        { name: '加拿大', value: [-97.1,49.9] },
        { name: '澳大利亚', value: [133.5,-25.3] },
        { name: '印尼', value: [106.8,-6.2] }
      ]
    },
    {
      type: 'scatter',
      coordinateSystem: 'geo',
      zlevel: 1,
      symbolSize: 1,
      itemStyle: { color: '#BFA99E' },
      data: Array(200).fill().map(() => [100 + Math.random() * 140, -30 + Math.random() * 70])
    }
  ]
};

export const chart1Config = {
  backgroundColor:'transparent',
  tooltip:{trigger:'axis',backgroundColor:'rgba(255,255,255,0.95)',borderColor:'#9C706A'},
  grid:{left:'10%',right:'10%',bottom:'15%',top:'10%'},
  xAxis:{
    type:'category',
    data:['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'],
    axisLine:{lineStyle:{color:'#D3C4BE'}},
    axisLabel:{color:'#665A57'}
  },
  yAxis:{
    type:'value',
    axisLine:{lineStyle:{color:'#D3C4BE'}},
    axisLabel:{color:'#665A57'},
    splitLine:{lineStyle:{color:'#EAE3DC'}}
  },
  series:[{
    type:'line',
    smooth:true,
    data:[85,156,224,298,355,321,389,432,476,521],
    symbol:'circle',
    symbolSize:6,
    lineStyle:{width:3,color:'#9C706A'},
    itemStyle:{color:'#9C706A'},
    areaStyle:{
      color:new echarts.graphic.LinearGradient(0,0,0,1,[
        {offset:0,color:'rgba(156,112,106,0.3)'},
        {offset:1,color:'rgba(156,112,106,0)'}
      ])
    }
  }]
};

export const chart2Config = {
  backgroundColor:'transparent',
  tooltip:{trigger:'item',backgroundColor:'rgba(255,255,255,0.95)',borderColor:'#9C706A'},
  legend:{
    orient:'vertical',
    right:10,
    top:'center',
    textStyle:{color:'#665A57'}
  },
  series:[{
    type:'pie',
    radius:['35%','65%'],
    center:['40%','50%'],
    data:[
      {name:'泰国',value:850},
      {name:'马来西亚',value:620},
      {name:'新加坡',value:410},
      {name:'印度尼西亚',value:330},
      {name:'美国',value:210},
      {name:'其他国家',value:180}
    ],
    itemStyle:{
      borderRadius:6,
      color:function(params){
        const colorList=['#9C706A','#D39E7A','#E1C2A8','#BFA99E','#D8B29C','#C2B4AE'];
        return colorList[params.dataIndex];
      }
    },
    label:{
      show:true,
      color:'#665A57'
    }
  }]
};

export const chart3Config = {
  backgroundColor:'transparent',
  tooltip:{trigger:'axis',backgroundColor:'rgba(255,255,255,0.95)',borderColor:'#9C706A'},
  grid:{left:'12%',right:'8%',bottom:'15%',top:'10%'},
  xAxis:{
    type:'category',
    data:['汕头','潮州','揭阳','梅州','汕尾'],
    axisLine:{lineStyle:{color:'#D3C4BE'}},
    axisLabel:{color:'#665A57',rotate:15}
  },
  yAxis:{
    type:'value',
    axisLine:{lineStyle:{color:'#D3C4BE'}},
    axisLabel:{color:'#665A57'},
    splitLine:{lineStyle:{color:'#EAE3DC'}}
  },
  series:[{
    type:'bar',
    data:[580,420,390,210,185],
    barWidth:'40%',
    itemStyle:{
      borderRadius:[4,4,0,0],
      color:new echarts.graphic.LinearGradient(0,0,0,1,[
        {offset:0,color:'#D39E7A'},
        {offset:1,color:'#9C706A'}
      ])
    }
  }]
};

export const chart4Config = {
  backgroundColor:'transparent',
  tooltip:{trigger:'axis',backgroundColor:'rgba(255,255,255,0.95)',borderColor:'#9C706A'},
  legend:{data:['东南亚','欧美澳'],textStyle:{color:'#665A57'},top:0},
  grid:{left:'10%',right:'10%',bottom:'15%',top:'15%'},
  xAxis:{
    type:'category',
    data:['2018','2019','2020','2021','2022','2023','2024'],
    axisLine:{lineStyle:{color:'#D3C4BE'}},
    axisLabel:{color:'#665A57'}
  },
  yAxis:{
    type:'value',
    axisLine:{lineStyle:{color:'#D3C4BE'}},
    axisLabel:{color:'#665A57'},
    splitLine:{lineStyle:{color:'#EAE3DC'}}
  },
  series:[
    {
      name:'东南亚',
      type:'line',
      smooth:true,
      data:[620,680,645,710,760,820,890],
      symbol:'circle',
      symbolSize:5,
      lineStyle:{width:2,color:'#9C706A'},
      itemStyle:{color:'#9C706A'}
    },
    {
      name:'欧美澳',
      type:'line',
      smooth:true,
      data:[180,220,250,290,340,390,450],
      symbol:'circle',
      symbolSize:5,
      lineStyle:{width:2,color:'#D39E7A'},
      itemStyle:{color:'#D39E7A'}
    }
  ]
};