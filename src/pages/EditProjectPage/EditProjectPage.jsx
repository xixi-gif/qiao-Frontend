import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Card, Select, Upload, message, Row, Col, DatePicker, InputNumber, Space, Typography, Breadcrumb, Divider, Tag } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from "../../../public/Nav/nav";
import api from "../../service/api";
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EditProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const fixImg = (url) => {
    if (!url) return '';
    let u = url.replace(/\\/g, '/');
    return `http://127.0.0.1:8090${u}`;
  };

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const res = await api.projectApi.getProjectDetail(id);
        const data = res.data;
        console.log("后端返回状态:", data.status);
        const fixedCover = fixImg(data.cover);
        setImageUrl(fixedCover);
        setStatus(data.status);

        form.setFieldsValue({
          title: data.title,
          category: data.category,
          tags: data.tags ? data.tags.split(',') : [],
          address: data.address,
          startTime: dayjs(data.start_time),
          endTime: dayjs(data.end_time),
          price: data.price,
          maxPeople: data.max_people,
          description: data.description,
          contact: data.contact
        });
      } catch (err) {
        message.error('加载项目信息失败');
      }
    };
    loadDetail();
  }, [id]);

  const uploadProps = {
    listType: 'picture-card',
    showUploadList: true,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error('图片大小不能超过 2MB');
        return false;
      }
      setFile(file);
      setImageUrl(URL.createObjectURL(file));
      return false;
    },
    onRemove: () => {
      setImageUrl('');
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('category', values.category);
      formData.append('tags', values.tags.join(','));
      formData.append('address', values.address);
      formData.append('start_time', values.startTime.toISOString());
      formData.append('end_time', values.endTime.toISOString());
      formData.append('price', values.price);
      formData.append('max_people', values.maxPeople);
      formData.append('description', values.description);
      formData.append('contact', values.contact);

      if (file) {
        formData.append('cover', file);
      }

      await api.projectApi.updateProject(id, formData);
      message.success('项目修改成功，等待重新审核');
      navigate('/merchant/profile');
    } catch (err) {
      message.error('修改失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusElement = () => {
    if (status === 'rejected') return <Tag color="error">已驳回</Tag>;
    if (status === 'pending') return <Tag color="processing">审核中</Tag>;
    if (status === 'active') return <Tag color="success">已上线</Tag>;
    return <Tag color="default">未知</Tag>;
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Breadcrumb style={{ marginBottom: 16 }}>
            <Breadcrumb.Item onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
              <HomeOutlined /> 首页
            </Breadcrumb.Item>
            <Breadcrumb.Item onClick={() => navigate('/merchant/profile')} style={{ cursor: 'pointer' }}>
              商家中心
            </Breadcrumb.Item>
            <Breadcrumb.Item>编辑文旅项目</Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/merchant/profile')}>
              返回
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Title level={2} style={{ margin: 0 }}>编辑文旅项目</Title>
              {getStatusElement()}
            </div>
            <div></div>
          </div>

          <Card>
            <Form form={form} layout="vertical" size="middle">
              <Title level={5} style={{ marginBottom: 16 }}>基础信息</Title>
              
              <Form.Item name="title" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input placeholder="请输入项目名称" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="category" label="项目分类" rules={[{ required: true }]}>
                    <Select placeholder="请选择分类">
                      <Option value="culture">文化体验</Option>
                      <Option value="tourism">旅游观光</Option>
                      <Option value="study">研学旅行</Option>
                      <Option value="handmade">非遗手作</Option>
                      <Option value="festival">民俗节庆</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="tags" label="项目标签" rules={[{ required: true }]}>
                    <Select mode="multiple" placeholder="可多选标签">
                      <Option value="亲子">亲子</Option>
                      <Option value="非遗">非遗</Option>
                      <Option value="网红">网红</Option>
                      <Option value="小众">小众</Option>
                      <Option value="研学">研学</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="项目封面图">
                <Upload 
                  {...uploadProps} 
                  fileList={
                    imageUrl ? [{
                      uid: '-1',
                      name: 'cover',
                      url: imageUrl,
                      status: 'done'
                    }] : []
                  }
                >
                  {!imageUrl && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>点击上传</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Divider />

              <Title level={5} style={{ marginBottom: 16 }}>项目详情</Title>

              <Form.Item name="address" label="项目地址" rules={[{ required: true }]}>
                <Input placeholder="请填写详细地址" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="startTime" label="开始时间" rules={[{ required: true }]}>
                    <DatePicker showTime style={{ width: '100%' }} placeholder="选择开始时间" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
                    <DatePicker showTime style={{ width: '100%' }} placeholder="选择结束时间" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="price" label="项目价格" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="请输入价格" addonAfter="元" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="maxPeople" label="最大参与人数" rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={1} placeholder="限制人数" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="description" label="项目介绍" rules={[{ required: true }]}>
                <TextArea rows={5} placeholder="详细介绍项目内容、特色、行程等" />
              </Form.Item>

              <Form.Item name="contact" label="联系电话" rules={[{ required: true }]}>
                <Input placeholder="商家联系电话" />
              </Form.Item>

              <Divider />

              <Form.Item style={{ textAlign: 'center', marginTop: 32 }}>
                <Space size="large">
                  <Button onClick={() => navigate('/merchant/profile')}>取消</Button>
                  <Button type="primary" loading={loading} onClick={handleSubmit} icon={<SaveOutlined />} size="middle">保存修改</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default EditProjectPage;