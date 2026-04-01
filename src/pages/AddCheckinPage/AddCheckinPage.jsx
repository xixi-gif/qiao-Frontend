import React, { useState } from 'react';
import { Layout, Card, Form, Input, Button, Upload, message, Typography } from 'antd';
import { UploadOutlined, LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';

const { Content } = Layout;
const { Title } = Typography;

const AddCheckin = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB');
      return false;
    }
    return true;
  };

  const handleUpload = async (file) => {
    setUploadLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.projectApi.uploadCheckinImage(formData);
      const url = res.data.image;
      setImageUrl(url);
      message.success('图片上传成功');
    } catch (err) {
      message.error('上传失败');
    } finally {
      setUploadLoading(false);
    }
  };

  const onFinish = async (values) => {
    if (!imageUrl) {
      message.warning('请上传打卡图片');
      return;
    }
    setLoading(true);
    try {
      await api.projectApi.createCheckin({
        title: values.title,
        content: values.content,
        image: imageUrl,
        tags: values.tags
      });
      message.success('发布打卡成功');
      navigate('/visitor/profile');
    } catch (err) {
      message.error('发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Button 
            icon={<LeftOutlined />} 
            onClick={() => navigate('/user/profile')} 
            style={{ marginBottom: 16 }}
          >
            返回个人中心
          </Button>
          <Title level={2} style={{ marginBottom: 24 }}>发布打卡</Title>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
            >
              <Form.Item
                name="title"
                label="打卡标题"
                rules={[{ required: true, message: '请输入打卡标题' }]}
              >
                <Input placeholder="请输入打卡标题" />
              </Form.Item>

              <Form.Item
                name="content"
                label="打卡内容"
                rules={[{ required: true, message: '请输入打卡内容' }]}
              >
                <Input.TextArea rows={4} placeholder="请输入打卡内容" />
              </Form.Item>

              <Form.Item
                name="tags"
                label="打卡标签"
              >
                <Input placeholder="多个标签用逗号分隔" />
              </Form.Item>

              <Form.Item label="打卡图片">
                <Upload
                  beforeUpload={beforeUpload}
                  customRequest={({ file }) => handleUpload(file)}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />} loading={uploadLoading}>
                    点击上传图片
                  </Button>
                </Upload>
                {imageUrl && (
                  <div style={{ marginTop: 16 }}>
                    <img 
                      src={`http://127.0.0.1:8090${imageUrl}`} 
                      style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }} 
                      alt="preview"
                    />
                  </div>
                )}
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  发布打卡
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AddCheckin;