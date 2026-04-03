import React, { useState, useEffect } from 'react';
import { 
  Layout, Card, Typography, Row, Col, Image, Tag, Button, 
  Space, message, Modal, Popconfirm 
} from 'antd';
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
  // 弹窗控制 + 当前查看的打卡数据
  const [visible, setVisible] = useState(false);
  const [currentCheckin, setCurrentCheckin] = useState(null);

  // 图片路径修复
  const fixImg = (url) => {
    if (!url) return '';
    let u = url.replace(/\\/g, '/');
    return `http://127.0.0.1:8090${u}`;
  };

  // 状态标签
  const getStatusTag = (status) => {
    switch (status) {
      case 'pending': return <Tag color="orange">待审核</Tag>;
      case 'approved': return <Tag color="green">已通过</Tag>;
      case 'rejected': return <Tag color="red">已驳回</Tag>;
      default: return <Tag color="default">未知</Tag>;
    }
  };

  // 获取我的打卡列表
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

  // 打开详情弹窗
  const showDetailModal = (item) => {
    setCurrentCheckin(item);
    setVisible(true);
  };

  // 关闭弹窗
  const handleClose = () => {
    setVisible(false);
    setCurrentCheckin(null);
  };

  // ✅ 逻辑删除（软删除）
  const handleDelete = async (id) => {
    try {
      await api.projectApi.deleteCheckin(id); 
      message.success('删除成功');
      handleClose();
      fetchAllCheckins(); // 刷新列表
    } catch (err) {
      message.error('删除失败');
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
                    {/* 👇 点击卡片打开详情 */}
                    <Card 
                      hoverable 
                      style={{ borderRadius: 8 }} 
                      bodyStyle={{ padding: 12 }}
                      onClick={() => showDetailModal(item)}
                    >
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

      {/* ====================== 打卡详情弹窗 ====================== */}
      <Modal
        title="打卡详情"
        open={visible}
        onCancel={handleClose}
        footer={null}
        width={500}
      >
        {currentCheckin && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <Image
                width="100%"
                style={{ maxHeight: 300, objectFit: 'cover' }}
                src={fixImg(currentCheckin.image)}
                fallback="https://picsum.photos/id/1036/800/450"
              />
            </div>

            <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
              {currentCheckin.title}
            </div>

            <div style={{ marginBottom: 8 }}>
              {getStatusTag(currentCheckin.status)}
            </div>

            <div style={{ color: '#666', lineHeight: 1.6, marginBottom: 16 }}>
              {currentCheckin.content}
            </div>

            <div style={{ fontSize: 12, color: '#999', marginBottom: 24 }}>
              发布时间：{currentCheckin.create_time}
            </div>

            {/* 删除按钮 */}
            <div style={{ textAlign: 'right' }}>
              <Popconfirm
                title="确定要删除这条打卡吗？"
                description="删除后将无法恢复"
                onConfirm={() => handleDelete(currentCheckin.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button danger>删除打卡</Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default UserCheckinsPage;