import React, { useState } from 'react';
import { Form, Input, Button, Card, Space, Upload, message, Divider, Layout } from 'antd';
import { SendOutlined, UploadOutlined, ClearOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';

const { Content } = Layout;

const AnnouncementPublish = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploadFileList, setUploadFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const currentUserId = 1;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const validFiles = [];
      uploadFileList.forEach(file => {
        if (file.status === 'done') {
          const name = file.name?.trim() || '';
          const url = (file.response?.data?.url || file.response?.url || file.url || '').trim();
          if (name && url) {
            validFiles.push({ name, url });
          }
        }
      });

      if (uploadFileList.length > 0 && validFiles.length === 0) {
        messageApi.error('所有附件上传失败或格式错误，请重新上传');
        setLoading(false);
        return;
      }

      const submitData = {
        title: values.title.trim(),
        content: values.content.trim(),
        status: 'published',
        creator_id: currentUserId,
        attachments: validFiles
      };

      const res = await api.announcementApi.publish(submitData);
      messageApi.success('公告发布成功！');
      navigate('/announcements');
    } catch (error) {
      console.error(error);
      if (error.errorFields) {
        const errMsg = error.errorFields.flatMap(f => f.errors).join('；');
        messageApi.error(`表单校验失败：${errMsg}`);
      } else {
        const errMsg = error.response?.data?.detail || error.message || '发布失败，请重试';
        messageApi.error(`公告发布失败：${errMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList }) => {
    setUploadFileList([...fileList]);
    const errorFile = fileList.find(f => f.status === 'error');
    if (errorFile) {
      const errMsg = errorFile.error?.message || errorFile.error?.response?.data?.detail || '未知错误';
      messageApi.error(`文件${errorFile.name}上传失败：${errMsg}`);
    }
  };

  const customRequest = async (options) => {
    const { file, onSuccess, onError, onProgress } = options;
    try {
      const res = await api.announcementApi.uploadFile(file);
      if (onProgress) {
        onProgress({ percent: 100 }, file);
      }
      onSuccess(res.data, file);
    } catch (err) {
      console.error('文件上传错误详情：', err);
      const errMsg = err.response?.data?.detail || err.message || '上传接口调用失败';
      onError({ message: errMsg }, file);
      messageApi.error(`文件${file.name}上传失败：${errMsg}`);
    }
  };

  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      messageApi.error('附件大小不能超过10MB！');
      return false;
    }
    const fileExt = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
    if (!allowedExts.includes(fileExt)) {
      messageApi.error(`仅支持${allowedExts.join('、')}格式文件！`);
      return false;
    }
    return true;
  };

  const resetForm = () => {
    form.resetFields();
    setUploadFileList([]);
    messageApi.info('表单已重置');
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      {contextHolder}
      <Navbar />
      <Content style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <Form form={form} layout="vertical" initialValues={{ status: 'published' }}>
              <Form.Item
                name="title"
                label="公告标题"
                rules={[
                  { required: true, message: '请输入公告标题' },
                  { max: 100, message: '标题长度不能超过100个字符' }
                ]}
              >
                <Input placeholder="请输入公告标题" size="large" />
              </Form.Item>
              <Form.Item
                name="content"
                label="公告内容"
                rules={[{ required: true, message: '请输入公告内容' }]}
              >
                <Input.TextArea placeholder="请输入公告内容" rows={12} size="large" />
              </Form.Item>
              <Form.Item label="附件上传">
                <Upload
                  fileList={uploadFileList}
                  listType="text"
                  customRequest={customRequest}
                  onChange={handleUploadChange}
                  beforeUpload={beforeUpload}
                  showUploadList={{ showRemoveIcon: true }}
                  multiple={true}
                >
                  <Button icon={<UploadOutlined />}>点击上传附件（最多10MB）</Button>
                </Upload>
              </Form.Item>
              <Divider />
              <Form.Item style={{ textAlign: 'right' }}>
                <Space size="large">
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    loading={loading}
                    size="large"
                    onClick={handleSubmit}
                    style={{ backgroundColor: '#9C706A', borderColor: '#9C706A' }}
                  >
                    发布公告
                  </Button>
                  <Button
                    icon={<ClearOutlined />}
                    size="large"
                    onClick={resetForm}
                  >
                    重置表单
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AnnouncementPublish;