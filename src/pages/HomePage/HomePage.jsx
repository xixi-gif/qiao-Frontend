import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Space, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BookOutlined, ArrowRightOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';
import * as echarts from 'echarts';
import chinaMap from '../../assets/world.json';
import { mapConfig, chart1Config, chart2Config, chart3Config, chart4Config } from './chartConfig';
import { qiaoxiangList } from './qiaoxiangData';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [carouselList, setCarouselList] = useState([]);
  const chartRef = useRef(null);
  const chart1 = useRef(null);
  const chart2 = useRef(null);
  const chart3 = useRef(null);
  const chart4 = useRef(null);
  const sliderRef = useRef(null);

  const fetchCarousels = async () => {
    try {
      const res = await api.carouselApi.getList({ skip: 0, limit: 10 });
      setCarouselList(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;
    const myChart = echarts.init(chartRef.current);
    echarts.registerMap('world', chinaMap);

    setTimeout(() => {
      myChart.setOption(mapConfig);
    }, 300);

    const ob = new ResizeObserver(() => myChart.resize());
    ob.observe(chartRef.current);
    return () => { ob.disconnect(); myChart.dispose(); };
  }, []);

  useEffect(() => {
    const c1 = echarts.init(chart1.current);
    c1.setOption(chart1Config);
    const o1 = new ResizeObserver(()=>c1.resize());
    o1.observe(chart1.current);
    return ()=>{o1.disconnect();c1.dispose();}
  },[])

  useEffect(() => {
    const c2 = echarts.init(chart2.current);
    c2.setOption(chart2Config);
    const o2 = new ResizeObserver(()=>c2.resize());
    o2.observe(chart2.current);
    return ()=>{o2.disconnect();c2.dispose();}
  },[])

  useEffect(() => {
    const c3 = echarts.init(chart3.current);
    c3.setOption(chart3Config);
    const o3 = new ResizeObserver(()=>c3.resize());
    o3.observe(chart3.current);
    return ()=>{o3.disconnect();c3.dispose();}
  },[])

  useEffect(() => {
    const c4 = echarts.init(chart4.current);
    c4.setOption(chart4Config);
    const o4 = new ResizeObserver(()=>c4.resize());
    o4.observe(chart4.current);
    return ()=>{o4.disconnect();c4.dispose();}
  },[])

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F5F2' }}>
      <Navbar />
      <Content>
        <Carousel autoplay effect="fade" style={{ height: 400 }}>
          {carouselList.map((item) => (
            <div key={item.id}>
              <div style={{ height: 400, background: `url(http://127.0.0.1:8090${item.image_path}) center/cover`, display: 'flex', alignItems: 'center', padding: '0 10%' }}>
                <div style={{ background: 'rgba(255,255,255,0.85)', padding: '32px', borderRadius: 12 }}>
                  <Title level={2} style={{ color: '#9C706A' }}>{item.title}</Title>
                  <Paragraph style={{ color: '#665A57' }}>{item.description}</Paragraph>
                  <Button type="primary" style={{ backgroundColor: '#9C706A', borderColor: '#9C706A', borderRadius:6 }}>查看详情 <ArrowRightOutlined /></Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <div style={{ background: 'linear-gradient(135deg, #9C706A 0%, #D39E7A 100%)', color: '#fff', padding: '48px 24px', textAlign: 'center' }}>
          <Title level={1} style={{ color: '#fff', fontSize: 42, margin:0 }}>南侨遗梦</Title>
          <Text style={{ opacity: 0.9, fontSize:16 }}>Southern Overseas Dreams</Text>
        </div>

        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 24px' }}>

          <Card style={{ marginBottom: 32, borderRadius: 16, background: '#F8F5F2', border: 'none', boxShadow: 'none' }}>
            <Title 
              level={2} 
              style={{ 
                textAlign: 'center', 
                color: '#9C706A', 
                marginBottom: 32, 
                fontSize: 42, 
                fontWeight: 'bold',
                fontFamily: "'SimSun', 'Microsoft YaHei', serif",
                textShadow: '2px 2px 4px rgba(156,112,106,0.3)',
                letterSpacing: '8px'
              }}
            >
              十大侨乡一览
            </Title>
            <div style={{ position: 'relative' }}>
              <div 
                ref={sliderRef} 
                style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollBehavior: 'smooth', padding: '0 20px 20px' }}
              >
                {qiaoxiangList.map((item) => (
                  <div key={item.id} style={{ minWidth: 320, flexShrink: 0, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', background: '#fff' }}>
                    <div style={{ height: 400, background: `url(${item.image}) center/cover`, position: 'relative' }}>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', padding: '24px 16px 16px' }}>
                        <Text style={{ color: '#fff', fontSize: 18, fontWeight: 600, display: 'block', marginBottom: 8 }}>{item.title}</Text>
                        <Text style={{ color: '#fff', fontSize: 16, opacity: 0.9 }}>{item.desc}</Text>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                icon={<LeftOutlined style={{ color: '#fff' }} />}
                onClick={handlePrev}
                style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', backgroundColor: '#9C706A', border: 'none', zIndex: 2 }}
              />
              <Button
                icon={<RightOutlined style={{ color: '#fff' }} />}
                onClick={handleNext}
                style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: '50%', backgroundColor: '#9C706A', border: 'none', zIndex: 2 }}
              />
            </div>
          </Card>

          <Card style={{ marginBottom: 32, borderRadius: 16, background:'#fff', borderColor:'#EAE3DC', boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
            <Row gutter={22}>
              <Col xs={24} xl={6}>
                <Card title="近十年侨胞输出趋势" style={{borderRadius:12,height:320,display:'flex',flexDirection:'column',background:'#fff',borderColor:'#EAE3DC'}} bodyStyle={{flex:1,padding:12}}>
                  <div ref={chart1} style={{width:'100%',height:'240px'}} />
                </Card>
                <div style={{height:16}} />
                <Card title="主要侨乡输出人数" style={{borderRadius:12,height:320,display:'flex',flexDirection:'column',background:'#fff',borderColor:'#EAE3DC'}} bodyStyle={{flex:1,padding:12}}>
                  <div ref={chart3} style={{width:'100%',height:'240px'}} />
                </Card>
              </Col>
              
              <Col xs={24} xl={12}>
                <div ref={chartRef} style={{ width: '100%', height: '600px' }} />
              </Col>
              
              <Col xs={24} xl={6}>
                <Card title="全球分布占比" style={{borderRadius:12,height:320,display:'flex',flexDirection:'column',background:'#fff',borderColor:'#EAE3DC'}} bodyStyle={{flex:1,padding:12}}>
                  <div ref={chart2} style={{width:'100%',height:'240px'}} />
                </Card>
                <div style={{height:16}} />
                <Card title="区域迁徙趋势对比" style={{borderRadius:12,height:320,display:'flex',flexDirection:'column',background:'#fff',borderColor:'#EAE3DC'}} bodyStyle={{flex:1,padding:12}}>
                  <div ref={chart4} style={{width:'100%',height:'240px'}} />
                </Card>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage