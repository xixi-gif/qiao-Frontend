import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Spin, Statistic } from "antd";
import { BarChartOutlined, UserOutlined, FileTextOutlined, EyeOutlined, LikeOutlined, StarOutlined, CommentOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "../../service/api";
import Navbar from "../../../public/Nav/nav";
import * as echarts from 'echarts';

const { Title } = Typography;
const { Content } = Layout;

const DataStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [trend, setTrend] = useState([]);
  const [period, setPeriod] = useState('month');

  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart4Ref = useRef(null);
  const chart5Ref = useRef(null);
  const chart6Ref = useRef(null);
  const chart7Ref = useRef(null);

  const loadData = async (p) => {
    setLoading(true);
    try {
      const res = await api.adminApi.getDashboard({ period: p });
      if (res.data.code === 200) setDashboard(res.data.data);
    } catch (err) { console.error(err); }

    try {
      const res2 = await api.adminApi.getTrend({ period: p });
      if (res2.data.code === 200) setTrend(res2.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  useEffect(() => {
    if (!dashboard || !chart1Ref.current) return;
    const myChart = echarts.init(chart1Ref.current);
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { data: ['总用户', '总项目', '总打卡', '总浏览', '点赞', '收藏', '评论'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          dashboard.total_users || 0,
          dashboard.total_projects || 0,
          dashboard.total_checkins || 0,
          dashboard.total_views || 0,
          dashboard.like_count || 0,
          dashboard.favorite_count || 0,
          dashboard.comment_count || 0
        ],
        itemStyle: { color: '#1890ff' }
      }]
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
    return () => myChart.dispose();
  }, [dashboard]);

  useEffect(() => {
    if (trend.length === 0 || !chart2Ref.current) return;
    const myChart = echarts.init(chart2Ref.current);
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['新增项目', '新增打卡', '点赞', '收藏', '评论'] },
      xAxis: { type: 'category', data: trend.map(i => i.date) },
      yAxis: { type: 'value' },
      series: [
        { name: '新增项目', type: 'line', data: trend.map(i => i.projects), itemStyle: { color: '#2ed573' } },
        { name: '新增打卡', type: 'line', data: trend.map(i => i.checkins), itemStyle: { color: '#00bfff' } },
        { name: '点赞', type: 'line', data: trend.map(i => i.likes), itemStyle: { color: '#ff6b6b' } },
        { name: '收藏', type: 'line', data: trend.map(i => i.favorites), itemStyle: { color: '#ffd93d' } },
        { name: '评论', type: 'line', data: trend.map(i => i.comments), itemStyle: { color: '#4ecdc4' } },
      ]
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
    return () => myChart.dispose();
  }, [trend]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.adminApi.getMerchantStatus();
      if (!chart4Ref.current) return;
      const data = res.data.data;
      const myChart = echarts.init(chart4Ref.current);
      myChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { data: ['正常商家', '无项目商家', '已封禁'], type: 'category' },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [data.normal, data.no_project, data.banned], itemStyle: { color: '#722ed1' } }]
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.adminApi.getTopProjects();
      if (!chart5Ref.current) return;
      const list = res.data.data;
      const myChart = echarts.init(chart5Ref.current);
      myChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '10%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          axisLabel: {
            formatter: function (value) {
              return value.length > 4 ? value.slice(0,4) + '...' : value;
            }
          },
          data: list.map(i => i.name)
        },
        series: [{ type: 'bar', data: list.map(i => i.value), itemStyle: { color: '#13c2c2' } }]
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.adminApi.getTopMerchants();
      if (!chart6Ref.current) return;
      const list = res.data.data;
      const myChart = echarts.init(chart6Ref.current);
      myChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '10%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          axisLabel: {
            formatter: function (value) {
              return value.length > 4 ? value.slice(0,4) + '...' : value;
            }
          },
          data: list.map(i => i.name)
        },
        series: [{ type: 'bar', data: list.map(i => i.value), itemStyle: { color: '#fa8c16' } }]
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.adminApi.getTopUsers();
      if (!chart7Ref.current) return;
      const list = res.data.data;
      const myChart = echarts.init(chart7Ref.current);
      myChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '10%', containLabel: true },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          axisLabel: {
            formatter: function (value) {
              return value.length > 4 ? value.slice(0,4) + '...' : value;
            }
          },
          data: list.map(i => i.name)
        },
        series: [{ type: 'bar', data: list.map(i => i.value), itemStyle: { color: '#722ed1' } }]
      });
    };
    fetchData();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: "30px 24px" }}>
        <div style={{ maxWidth: 1600, margin: "0 auto" }}>
          <Title level={3} style={{ margin: '0 0 20px 0', color: '#9C706A', fontWeight: 600 }}>
            <BarChartOutlined /> 平台数据统计
          </Title>

          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ marginBottom: 16, display: 'flex', gap: '8px' }}>
              <Button type={period === 'day' ? 'primary' : 'default'} onClick={() => setPeriod('day')} style={period === 'day' ? { backgroundColor: '#9C706A', borderColor: '#9C706A' } : {}}>今日</Button>
              <Button type={period === 'week' ? 'primary' : 'default'} onClick={() => setPeriod('week')} style={period === 'week' ? { backgroundColor: '#9C706A', borderColor: '#9C706A' } : {}}>本周</Button>
              <Button type={period === 'month' ? 'primary' : 'default'} onClick={() => setPeriod('month')} style={period === 'month' ? { backgroundColor: '#9C706A', borderColor: '#9C706A' } : {}}>本月</Button>
              <Button type={period === 'year' ? 'primary' : 'default'} onClick={() => setPeriod('year')} style={period === 'year' ? { backgroundColor: '#9C706A', borderColor: '#9C706A' } : {}}>全年</Button>
            </div>

            <Spin spinning={loading}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}><Statistic title="平台总用户" value={dashboard?.total_users || 0} prefix={<UserOutlined />} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="平台总项目" value={dashboard?.total_projects || 0} prefix={<FileTextOutlined />} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="平台总打卡" value={dashboard?.total_checkins || 0} prefix={<CheckCircleOutlined />} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="平台总浏览" value={dashboard?.total_views || 0} prefix={<EyeOutlined />} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="本期发布项目" value={dashboard?.period_projects || 0} prefix={<FileTextOutlined />} valueStyle={{ color: '#2ed573' }} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="本期发布打卡" value={dashboard?.period_checkins || 0} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#00bfff' }} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="点赞数" value={dashboard?.like_count || 0} prefix={<LikeOutlined />} valueStyle={{ color: '#ff6b6b' }} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="收藏数" value={dashboard?.favorite_count || 0} prefix={<StarOutlined />} valueStyle={{ color: '#ffd93d' }} /></Col>
                <Col xs={24} sm={12} md={6}><Statistic title="评论数" value={dashboard?.comment_count || 0} prefix={<CommentOutlined />} valueStyle={{ color: '#4ecdc4' }} /></Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}><Card title="平台数据概览" size="small"><div ref={chart1Ref} style={{ width: '100%', height: 300 }} /></Card></Col>
                <Col xs={24} lg={12}><Card title="平台趋势变化" size="small"><div ref={chart2Ref} style={{ width: '100%', height: 300 }} /></Card></Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}><Card title="商家状态统计" size="small"><div ref={chart4Ref} style={{ width: '100%', height: 300 }} /></Card></Col>
                <Col xs={24} lg={12}><Card title="活跃项目TOP5" size="small"><div ref={chart5Ref} style={{ width: '100%', height: 300 }} /></Card></Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} lg={12}><Card title="活跃商家TOP5" size="small"><div ref={chart6Ref} style={{ width: '100%', height: 300 }} /></Card></Col>
                <Col xs={24} lg={12}><Card title="活跃用户TOP5" size="small"><div ref={chart7Ref} style={{ width: '100%', height: 300 }} /></Card></Col>
              </Row>
            </Spin>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default DataStatistics;