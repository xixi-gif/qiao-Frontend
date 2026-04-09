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
  const [imageUrl, setImageUrl] = useState();
  const [file, setFile] = useState(null);

  const uploadProps = {
    listType: 'picture-card',
    showUploadList: true,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片');
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error('2MB以内');
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

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('tags', values.tags || '');

      if (file) {
        formData.append('image', file);
      }

      await api.projectApi.createCheckin(formData);
      message.success('发布成功');
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
          <Button icon={<LeftOutlined />} onClick={() => navigate('/visitor/profile')} style={{ marginBottom: 16 }}>
            返回
          </Button>
          <Title level={2}>发布打卡</Title>
          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                <Input />
              </Form.Item>

              <Form.Item name="content" label="内容" rules={[{ required: true }]}>
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item name="tags" label="标签">
                <Input placeholder="逗号分隔" />
              </Form.Item>

              <Form.Item label="图片" rules={[{ required: true, message: '请上传图片' }]}>
                <Upload {...uploadProps}>
                  {imageUrl ? null : (
                    <div>
                      <UploadOutlined />
                      <div>点击上传</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block style={{ backgroundColor: '#9C706A', borderColor: '#9C706A', color: '#fff' }}>
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