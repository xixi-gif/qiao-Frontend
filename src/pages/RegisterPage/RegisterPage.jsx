import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, UsergroupAddOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

const { Option } = Select;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('visitor');

  const onFinish = async (values) => {
    setLoading(true);
    const postData = {
      username: String(values.nickname),
      phone: String(values.username),
      password: String(values.password),
      confirm_password: String(values.confirm),
      role: role
    };
    console.log("前端准备发送的参数：", postData);
    try {
      const res = await api.authApi.register(postData);
      console.log("接口返回结果：", res);
      if (res.data?.code === 200) {
        message.success('注册成功！即将跳转到登录页');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 800);
      } else {
        const errMsg = res.data?.message || res.data?.detail || '注册失败，请重试';
        message.error(errMsg);
      }
    } catch (err) {
      console.log("请求错误详情：", err);
      console.log("后端返回的错误数据：", err.response?.data);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || err.message || '注册失败，请重试';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
    message.error('请检查输入内容是否符合要求');
  };

  const roleOptions = [
    { value: 'visitor', label: '访客', icon: <EyeOutlined /> },
    { value: 'merchant', label: '商家', icon: <ShopOutlined /> }
  ];

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      backgroundImage: 'url("../../../public/img/2.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '850px',
        height: '700px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        alignItems: 'center'
      }}>
        <div style={{
          width: '400px',
          padding: '0 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <Card 
            style={{ 
              width: '100%',
              boxShadow: 'none',
              border: 'none',
              padding: '24px'
            }}
          >
            <div style={{ 
              textAlign: 'left', 
              marginBottom: 24 
            }}>
              <h1 style={{ 
                fontSize: 42, 
                fontWeight: 600, 
                color: '#9C706A',
                margin: 0
              }}>
                注册
              </h1>
            </div>

            <Form
              name="register_form"
              initialValues={{}}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              scrollToFirstError
              layout="vertical"
            >
              <Form.Item
                name="role"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>请选择身份</span>}
                rules={[{ required: true, message: '请选择您的身份' }]}
                style={{ marginBottom: 16 }}
              >
                <Select
                  value={role}
                  onChange={(value) => setRole(value)}
                  size="large"
                  placeholder="请选择身份"
                  showSearch
                  filterOption={(input, option) => 
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {roleOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {item.icon}
                        <span style={{ marginLeft: 8 }}>{item.label}</span>
                      </span>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="nickname"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>用户名</span>}
                rules={[
                  { required: true, message: '请设置用户名' },
                  { min: 2, message: '用户名至少2个字符' },
                  { max: 16, message: '用户名最多16个字符' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请设置您的用户名" 
                  size="large"
                  disabled={loading}
                  maxLength={16}
                />
              </Form.Item>

              <Form.Item
                name="username"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>手机号</span>}
                rules={[
                  { required: true, message: '请输入手机号' },
                  { 
                    pattern: /^1[3-9]\d{9}$/, 
                    message: '请输入正确的11位手机号' 
                  }
                ]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请输入11位手机号" 
                  size="large"
                  disabled={loading}
                  maxLength={11}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>密码</span>}
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>确认密码</span>}
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入密码"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  style={{ width: '100%', height: 40, backgroundColor: '#9C706A', borderColor: '#9C706A' }}
                  loading={loading}
                >
                  注册
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', color: '#9C706A', fontWeight: 'bold' }}>
                已有账号? <a 
                  href="/login" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                  style={{ color: '#345276' }}
                >
                  立即登录
                </a>
              </div>
            </Form>
          </Card>
        </div>

        <div style={{
          flex: 'none',
          width: '420px',
          height: '600px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <img
            src="../../../public/img/1.jpg"
            alt="login-bg"
            style={{
              width: 'auto',
              height: '90%',
              maxWidth: '90%',
              objectFit: 'cover',
              borderRadius: '12px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;