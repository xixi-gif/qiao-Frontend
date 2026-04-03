import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Row, Col, Image, Button, Breadcrumb, Empty } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const UserLikes = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fixImg = (url) => {
    if (!url) return '';
    return 'http://127.0.0.1:8090' + url;
  };

  useEffect(() => {
    api.authApi.getUserLikes().then(res => {
      setList(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const goTo = (item) => {
    if (!item.exists) return;
    if (item.target_type === 'project') {
      navigate(`/tour/detail/${item.target_id}`);
    } else if (item.target_type === 'checkin') {
      navigate(`/checkin/detail/${item.target_id}`);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item onClick={() => navigate('/')}><HomeOutlined />首页</Breadcrumb.Item>
            <Breadcrumb.Item>我的点赞</Breadcrumb.Item>
          </Breadcrumb>

          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
            返回
          </Button>

          <Title level={4} style={{ marginBottom: 20 }}>我的点赞</Title>

          {loading ? (
            <Card loading />
          ) : list.length === 0 ? (
            <Empty description="暂无点赞" />
          ) : (
            <Row gutter={[16, 16]}>
              {list.map(item => (
                <Col xs={8} sm={8} key={item.target_id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 10, height: '100%' }}
                    bodyStyle={{ padding: 12 }}
                    onClick={() => goTo(item)}
                  >
                    {item.exists ? (
                      <Image
                        height={140}
                        width="100%"
                        style={{ objectFit: 'cover', borderRadius: 6 }}
                        src={fixImg(item.cover)}
                        fallback="https://picsum.photos/id/1036/400/300"
                      />
                    ) : (
                      <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#999' }}>
                        <DeleteOutlined style={{ fontSize: 24, marginBottom: 8 }} />
                        <div style={{ fontSize: 12 }}>{item.title}</div>
                      </div>
                    )}
                    <div style={{ fontSize: 14, marginTop: 10, fontWeight: 500, color: item.exists ? '#333' : '#999' }}>
                      {item.title}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default UserLikes;