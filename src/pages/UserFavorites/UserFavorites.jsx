import React, { useState, useEffect } from 'react';
import { Layout, Card, Typography, Row, Col, Image, Button, Breadcrumb } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const UserFavorites = () => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fixImg = (url) => {
    if (!url) return '';
    return 'http://127.0.0.1:8090' + url;
  };

  useEffect(() => {
    api.authApi.getUserFavorites().then(res => {
      setList(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item onClick={() => navigate('/')}><HomeOutlined />首页</Breadcrumb.Item>
            <Breadcrumb.Item>我的收藏</Breadcrumb.Item>
          </Breadcrumb>

          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
            返回
          </Button>

          <Title level={4} style={{ marginBottom: 20 }}>我的收藏</Title>

          {loading ? (
            <Card loading />
          ) : list.length === 0 ? (
            <Typography.Text type="secondary">暂无收藏</Typography.Text>
          ) : (
            <Row gutter={[16, 16]}>
              {list.map(item => (
                <Col xs={8} sm={8} key={item.project_id}>
                  <Card
                    hoverable
                    style={{ borderRadius: 10, height: '100%' }}
                    bodyStyle={{ padding: 12 }}
                    onClick={() => navigate(`/tour/detail/${item.project_id}`)}
                  >
                    <Image
                      height={140}
                      width="100%"
                      style={{ objectFit: 'cover', borderRadius: 6 }}
                      src={fixImg(item.cover)}
                      fallback="https://picsum.photos/id/1036/400/300"
                    />
                    <div style={{ fontSize: 14, marginTop: 10, fontWeight: 500 }}>
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

export default UserFavorites;