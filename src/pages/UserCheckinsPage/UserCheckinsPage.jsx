import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Row, Col, Image, Tag, Button, Space, message } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const UserCheckinsPage = () => {
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);

  const fixImg = (url) => {
    if (!url) return '';
    let u = url.replace(/\\/g, '/');
    return `http://127.0.0.1:8090${u}`;
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending': return <Tag color="orange">待审核</Tag>;
      case 'approved': return <Tag color="green">已通过</Tag>;
      case 'rejected': return <Tag color="red">已驳回</Tag>;
      default: return <Tag color="default">未知</Tag>;
    }
  };

  const fetchAllCheckins = async () => {
    setLoading(true);
    try {
      const res = await api.projectApi.getMyCheckins();
      setCheckins(res.data || []);
    } catch (err) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCheckins();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Button icon={<LeftOutlined />} onClick={() => navigate('/visitor/profile')}>
              返回个人中心
            </Button>
            <Title level={2} style={{ margin: 0 }}>我的全部打卡</Title>
            <div></div>
          </div>

          <Card loading={loading}>
            {checkins.length > 0 ? (
              <Row gutter={[16, 16]}>
                {checkins.map((item) => (
                  <Col xs={12} sm={8} md={6} key={item.id}>
                    <Card hoverable style={{ borderRadius: 8 }} bodyStyle={{ padding: 12 }}>
                      <Image
                        height={140}
                        style={{ borderRadius: 6, objectFit: 'cover' }}
                        src={fixImg(item.image)}
                        fallback="https://picsum.photos/id/1036/400/300"
                      />
                      <div style={{ fontSize: 14, marginTop: 10, fontWeight: 500 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.4 }}>
                        {item.content.length > 20 ? item.content.slice(0, 20) + '...' : item.content}
                      </div>
                      <div style={{ marginTop: 6 }}>{getStatusTag(item.status)}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                        {item.create_time}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Typography.Text type="secondary">暂无打卡记录</Typography.Text>
              </div>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default UserCheckinsPage;