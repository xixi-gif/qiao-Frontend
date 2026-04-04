import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Spin, Statistic } from "antd";
import { BarChartOutlined, EyeOutlined, LikeOutlined, StarOutlined, CommentOutlined, FileTextOutlined } from "@ant-design/icons";
import api from "../../service/api";
import Navbar from "../../../public/Nav/nav";
import * as echarts from 'echarts';

const { Title } = Typography;
const { Content } = Layout;

const DataAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [trend, setTrend] = useState([]);
  const [period, setPeriod] = useState('month');

  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);

  const loadData = async (p) => {
    setLoading(true);
    try {
      const res = await api.merchantApi.getAnalysis({ period: p });
      if (res.data.code === 200) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const res2 = await api.merchantApi.getTrend({ period: p });
      if (res2.data.code === 200) {
        setTrend(res2.data.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData(period);
  }, [period]);

  // 总览柱状图
  useEffect(() => {
    if (!dashboard || !chart1Ref.current) return;
    const myChart = echarts.init(chart1Ref.current);
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { data: ['总发布数', '总浏览量', '点赞数', '收藏数', '评论数'] },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: [
          dashboard.publish_count || 0,
          dashboard.view_count || 0,
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

  // 趋势折线图
  useEffect(() => {
    if (trend.length === 0 || !chart2Ref.current) return;
    const myChart = echarts.init(chart2Ref.current);
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['点赞', '收藏', '评论'] },
      xAxis: {
        type: 'category',
        data: trend.map(i => i.date)
      },
      yAxis: { type: 'value' },
      series: [
        { name: '点赞', type: 'line', data: trend.map(i => i.likes), itemStyle: { color: '#ff6b6b' } },
        { name: '收藏', type: 'line', data: trend.map(i => i.favorites), itemStyle: { color: '#ffd93d' } },
        { name: '评论', type: 'line', data: trend.map(i => i.comments), itemStyle: { color: '#4ecdc4' } }
      ]
    };
    myChart.setOption(option);
    window.addEventListener('resize', () => myChart.resize());
    return () => myChart.dispose();
  }, [trend]);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <Card style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <Button type={period === 'day' ? 'primary' : 'default'} onClick={() => setPeriod('day')}>今日</Button>
              <Button type={period === 'week' ? 'primary' : 'default'} onClick={() => setPeriod('week')} style={{ margin: '0 8px' }}>本周</Button>
              <Button type={period === 'month' ? 'primary' : 'default'} onClick={() => setPeriod('month')} style={{ marginRight: 8 }}>本月</Button>
              <Button type={period === 'year' ? 'primary' : 'default'} onClick={() => setPeriod('year')}>全年</Button>
            </div>

            <Spin spinning={loading}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="总发布项目" value={dashboard?.publish_count || 0} prefix={<FileTextOutlined />} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="总浏览量" value={dashboard?.view_count || 0} prefix={<EyeOutlined />} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="点赞数" value={dashboard?.like_count || 0} prefix={<LikeOutlined />} valueStyle={{ color: '#ff6b6b' }} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="收藏数" value={dashboard?.favorite_count || 0} prefix={<StarOutlined />} valueStyle={{ color: '#ffd93d' }} />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Statistic title="评论数" value={dashboard?.comment_count || 0} prefix={<CommentOutlined />} valueStyle={{ color: '#4ecdc4' }} />
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                  <Card title="数据概览" size="small">
                    <div ref={chart1Ref} style={{ width: '100%', height: 300 }} />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card title="趋势变化" size="small">
                    <div ref={chart2Ref} style={{ width: '100%', height: 300 }} />
                  </Card>
                </Col>
              </Row>
            </Spin>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default DataAnalysis;