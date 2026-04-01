import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, Card, Select, Upload, message, Row, Col, DatePicker, InputNumber, Space, Typography, Breadcrumb, Divider } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, SaveOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AddProjectPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [file, setFile] = useState(null);

  // 从数据库获取的 分类 + 标签
  const [categoryList, setCategoryList] = useState([]);
  const [tagList, setTagList] = useState([]);

  // ✅ 页面加载时自动获取数据库数据（完美使用你的现有接口）
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取分类（你的接口：GET /categories）
        const cateRes = await api.categoryApi.getList({ limit: 100 });
        setCategoryList(cateRes.data || []);

        // 获取标签
        const tagRes = await api.tagApi.getList({ limit: 100 });
        setTagList(tagRes.data || []);
      } catch (err) {
        message.error('获取分类/标签失败，请刷新重试');
      }
    };
    fetchData();
  }, []);

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
      setImageUrl(null);
      setFile(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append('title', values.title);
      
      // ✅ 直接提交【中文分类名】到后端
      formData.append('category', values.category);
      
      // ✅ 直接提交【中文标签】到后端
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

      await api.projectApi.createProject(formData);
      message.success('项目提交成功，等待审核');
      navigate('/merchant/profile');
    } catch (err) {
      message.error(err.response?.data?.detail || '提交失败');
    } finally {
      setLoading(false);
    }
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
            <Breadcrumb.Item>发布文旅项目</Breadcrumb.Item>
          </Breadcrumb>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/merchant/profile')}>
              返回
            </Button>
            <Title level={2} style={{ margin: 0 }}>发布文旅项目</Title>
            <div></div>
          </div>

          <Card>
            <Form form={form} layout="vertical" size="middle" initialValues={{ status: 'pending' }}>
              <Title level={5} style={{ marginBottom: 16 }}>基础信息</Title>
              
              <Form.Item name="title" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
                <Input placeholder="请输入项目名称" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="category" label="项目分类" rules={[{ required: true }]}>
                    {/* ✅ 动态渲染数据库分类 */}
                    <Select placeholder="请选择分类">
                      {categoryList.map(item => (
                        <Option key={item.id} value={item.name}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="tags" label="项目标签" rules={[{ required: true }]}>
                    {/* ✅ 动态渲染数据库标签 */}
                    <Select mode="multiple" placeholder="可多选标签">
                      {tagList.map(item => (
                        <Option key={item.id} value={item.name}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="cover" label="项目封面图" rules={[{ required: true, message: '请上传封面图' }]}>
                <Upload {...uploadProps}>
                  {imageUrl ? null : (
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
                  <Button type="primary" loading={loading} onClick={handleSubmit} icon={<SaveOutlined />} size="middle">提交项目</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AddProjectPage;