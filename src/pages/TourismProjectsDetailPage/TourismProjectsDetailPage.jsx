import React, { useState, useEffect } from 'react';
import { Layout, Card, Image, Tag, Descriptions, Button, message, Space, Typography, Divider, Popconfirm } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;
const { Title } = Typography;

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const fetchProjectDetail = async () => {
    try {
      setLoading(true);
      const res = await api.projectApi.getProjectDetail(id);
      const data = res.data;
      setProject(data);
      setIsOwner(data.merchant_id === userInfo.id);
    } catch (err) {
      message.error('获取项目详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.projectApi.deleteProject(id);
      message.success('删除成功');
      navigate('/merchant/profile');
    } catch (err) {
      message.error('删除失败');
    }
  };

  const getProjectTag = (status) => {
    if (status === 'pending') {
      return <Tag color="processing">审核中</Tag>;
    } else if (status === 'active') {
      return <Tag color="success">已上线</Tag>;
    } else if (status === 'rejected') {
      return <Tag color="error">已驳回</Tag>;
    } else {
      return <Tag color="default">未知状态</Tag>;
    }
  };

  const fixImg = (url) => {
    if (!url) return '';
    let u = url.replace(/\\/g, '/');
    return `http://127.0.0.1:8090${u}`;
  };

  useEffect(() => {
    if (id) fetchProjectDetail();
  }, [id]);

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>返回</Button>
          <Card loading={loading}>
            {project && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Title level={3}>{project.title}</Title>
                  {isOwner && (
                    <Space>
                      <Button icon={<EditOutlined />} onClick={() => navigate(`/merchant/edit-project/${id}`)}>编辑项目</Button>
                      <Popconfirm title="确定要删除该项目吗？" description="删除后无法恢复" onConfirm={handleDelete} okText="确定" cancelText="取消">
                        <Button danger icon={<DeleteOutlined />}>删除项目</Button>
                      </Popconfirm>
                    </Space>
                  )}
                </div>
                <Image width="100%" height={400} style={{ objectFit: 'cover', borderRadius: 8 }} src={fixImg(project.cover)} fallback="https://picsum.photos/id/1036/800/400" />
                <Divider />
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="项目分类">{project.category}</Descriptions.Item>
                  <Descriptions.Item label="项目标签">{project.tags.split(',').map((t, i) => <Tag key={i}>{t}</Tag>)}</Descriptions.Item>
                  <Descriptions.Item label="项目地址">{project.address}</Descriptions.Item>
                  <Descriptions.Item label="开始时间">{project.start_time}</Descriptions.Item>
                  <Descriptions.Item label="结束时间">{project.end_time}</Descriptions.Item>
                  <Descriptions.Item label="项目价格">¥{project.price}</Descriptions.Item>
                  <Descriptions.Item label="最大参与人数">{project.max_people}</Descriptions.Item>
                  <Descriptions.Item label="联系电话">{project.contact}</Descriptions.Item>
                  <Descriptions.Item label="审核状态">{getProjectTag(project.status)}</Descriptions.Item>
                  <Descriptions.Item label="浏览量"><EyeOutlined /> {project.views}</Descriptions.Item>
                  <Descriptions.Item label="订单量"><ShoppingCartOutlined /> {project.orders}</Descriptions.Item>
                </Descriptions>
                <Divider />
                <Title level={5}>项目介绍</Title>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{project.description}</div>
              </>
            )}
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ProjectDetail;