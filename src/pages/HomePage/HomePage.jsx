import React, { useState, useEffect } from 'react';
import { Layout, Typography, Row, Col, Card, Button, Space, Divider, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, BookOutlined, EnvironmentOutlined, CompassOutlined, HistoryOutlined, ArrowRightOutlined } from '@ant-design/icons';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [carouselList, setCarouselList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCarousels = async () => {
    try {
      const res = await api.carouselApi.getList({ skip: 0, limit: 10 });
      setCarouselList(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarousels();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content>
        <Carousel autoplay effect="fade" style={{ maxHeight: 400, overflow: 'hidden' }}>
          {carouselList.map((item) => (
            <div key={item.id}>
              <div style={{ background: `url(http://127.0.0.1:8090${item.image_path}) center/cover no-repeat`, height: 400, display: 'flex', alignItems: 'center', padding: '0 10%' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '32px', borderRadius: 8, maxWidth: 600 }}>
                  <Title level={2} style={{ margin: 0 }}>{item.title}</Title>
                  <Paragraph style={{ fontSize: 16, marginTop: 16 }}>{item.description}</Paragraph>
                  <Button type="primary" size="large" style={{ marginTop: 16 }} onClick={() => window.location.href = item.link}>
                    查看详情 <ArrowRightOutlined />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        <div style={{ background: 'linear-gradient(135deg, #1a2a3a 0%, #0f1e2e 100%)', color: '#fff', padding: '40px 24px', textAlign: 'center' }}>
          <Title level={1} style={{ color: '#fff', fontSize: 42, fontWeight: 700, margin: '0 0 8px 0' }}>南侨遗梦</Title>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, letterSpacing: 2 }}>Southern Overseas Dreams</Text>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <Card bordered={false} style={{ marginBottom: 32, borderRadius: 12 }} title={<Space><BookOutlined style={{ fontSize: 18 }} /><span style={{ fontSize: 18, fontWeight: 500 }}>潮汕侨乡</span></Space>}>
            <Paragraph style={{ fontSize: 15, lineHeight: 1.8 }}>潮汕侨乡地处粤东沿海，主要包括汕头、潮州、揭阳三市，背靠莲花山脉，韩江、榕江、练江三江入海，自古为海上丝绸之路节点；核心出海口有樟林古港（清代粤东第一大港）、汕头港等；地狭人稠、耕地有限，推动潮人“过番”谋生。</Paragraph>
            <Divider />
            <Row gutter={24}>
              <Col xs={24} sm={12} md={6}><Card size="small" hoverable style={{ borderRadius: 8 }} title="揭阳侨乡"><Paragraph style={{ fontSize: 13, lineHeight: 1.7 }}>揭阳是潮汕地区面积较大、侨胞分布极广的侨乡。历史上不少揭阳人从樟林古港、汕头港“过番”下南洋，勤劳打拼。</Paragraph></Card></Col>
              <Col xs={24} sm={12} md={6}><Card size="small" hoverable style={{ borderRadius: 8 }} title="汕头侨乡"><Paragraph style={{ fontSize: 13, lineHeight: 1.7 }}>汕头是潮汕侨乡的核心城市，也是近代中国重要的移民出海口。1860年开埠后，大量潮人从这里前往东南亚。</Paragraph></Card></Col>
              <Col xs={24} sm={12} md={6}><Card size="small" hoverable style={{ borderRadius: 8 }} title="潮州侨乡"><Paragraph style={{ fontSize: 13, lineHeight: 1.7 }}>潮州是潮汕文化发源地，也是历史悠久的著名侨乡。海外潮人把潮剧、工夫茶、潮州菜带到世界各地。</Paragraph></Card></Col>
            </Row>
          </Card>

          <Card bordered={false} style={{ marginBottom: 32, borderRadius: 12 }} title={<Space><HistoryOutlined style={{ fontSize: 18 }} /><span style={{ fontSize: 18, fontWeight: 500 }}>核心文化遗产与标志</span></Space>}>
            <Row gutter={24}>
              <Col xs={24} sm={8}><Card hoverable size="small" style={{ borderRadius: 8 }}><Title level={5} style={{ margin: 0 }}>红头船</Title><Paragraph style={{ marginTop: 8, fontSize: 13 }}>清代潮籍商船标志性涂装，樟林古港复原船是侨乡精神象征。</Paragraph></Card></Col>
              <Col xs={24} sm={8}><Card hoverable size="small" style={{ borderRadius: 8 }}><Title level={5} style={{ margin: 0 }}>侨批（银信）</Title><Paragraph style={{ marginTop: 8, fontSize: 13 }}>2013年入选世界记忆遗产，是潮人寄回家乡的汇款+家书。</Paragraph></Card></Col>
              <Col xs={24} sm={8}><Card hoverable size="small" style={{ borderRadius: 8 }}><Title level={5} style={{ margin: 0 }}>侨宅 / 骑楼</Title><Paragraph style={{ marginTop: 8, fontSize: 13 }}>汕头开埠区、澄海等地留存大量侨资建造的中西合璧建筑。</Paragraph></Card></Col>
            </Row>
          </Card>

          <Card bordered={false} style={{ marginBottom: 32, borderRadius: 12 }} title={<Space><CompassOutlined style={{ fontSize: 18 }} /><span style={{ fontSize: 18, fontWeight: 500 }}>十大侨乡一览</span></Space>}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}><Card size="small" style={{ borderRadius: 8 }}><Text strong>1 千年古村：</Text><Paragraph style={{ margin: 0, fontSize: 13 }}>濠江区广澳街道东湖社区</Paragraph></Card></Col>
              <Col xs={24} sm={12} md={8}><Card size="small" style={{ borderRadius: 8 }}><Text strong>2 侨批之乡：</Text><Paragraph style={{ margin: 0, fontSize: 13 }}>潮南区成田镇田中央社区</Paragraph></Card></Col>
              <Col xs={24} sm={12} md={8}><Card size="small" style={{ borderRadius: 8 }}><Text strong>3 著名侨村：</Text><Paragraph style={{ margin: 0, fontSize: 13 }}>龙湖区外砂街道蓬中村</Paragraph></Card></Col>
            </Row>
          </Card>

          <Card bordered={false} style={{ marginBottom: 32, borderRadius: 12 }} title={<Space><EnvironmentOutlined style={{ fontSize: 18 }} /><span style={{ fontSize: 18, fontWeight: 500 }}>樟林古港｜红头船故乡</span></Space>}>
            <Paragraph style={{ lineHeight: 1.9, fontSize: 15 }}>位于汕头澄海东里镇，唐代为樟树成林的海滨渔村；明嘉靖三十五年（1556）始建樟林寨，万历起成渔埠；2019年列为第九批广东省文物保护单位，占地约2平方千米。<br /><br />康熙二十三年（1684）海禁放宽后快速崛起，乾隆—嘉庆达全盛，称粤东“通洋总汇”，形成六社八街商埠格局，是清代粤东第一大港、红头船（1723年官方定广东商船漆红船头）的核心启航地。</Paragraph>
            <div style={{ marginTop: 12 }}><Text type="secondary">📍 汕头市澄海区</Text></div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
            <Button danger icon={<LogoutOutlined />} onClick={handleLogout} style={{ borderRadius: 6 }}>退出登录</Button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default HomePage;