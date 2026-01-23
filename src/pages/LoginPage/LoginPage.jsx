import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Select, message } from 'antd';
import { UserOutlined, LockOutlined, UsergroupAddOutlined, EyeOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('visitor');
  const [loading, setLoading] = useState(false);
  
  const roleOptions = [
    { value: 'visitor', label: '访客', icon: <EyeOutlined /> },
    { value: 'admin', label: '管理员', icon: <UsergroupAddOutlined /> },
    { value: 'merchant', label: '商家', icon: <ShopOutlined /> }
  ];

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.authApi.login({
        phone: values.username,
        password: values.password,
        role: role,
        remember: values.remember
      });
      if (!res._isError) {
        localStorage.setItem('accessToken', res.data.access_token);
        localStorage.setItem('userInfo', JSON.stringify(res.data.user_info));
        message.success('登录成功！');
        setTimeout(() => {
          navigate('/home', { replace: true });
        }, 800);
      } else {
        const errMsg = res.message || res.data?.message || res.data?.detail || '登录失败，请检查账号密码';
        message.error(errMsg);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.detail || err.message || '登录失败，请检查账号密码';
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log(errorInfo);
    message.error('请检查输入内容是否符合要求');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '24px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <Card 
        style={{ 
          maxWidth: 400, 
          width: '100%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 8,
          border: 'none',
          padding: '24px'
        }}
      >
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 24 
        }}>
          <h1 style={{ 
            fontSize: 24, 
            fontWeight: 600, 
            color: 'rgba(0, 0, 0, 0.85)',
            margin: 0
          }}>
            南桥遗梦
          </h1>
        </div>

        <Form
          name="login_form"
          initialValues={{ remember: true, role: 'visitor' }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          scrollToFirstError
          layout="vertical"
        >
          <Form.Item
            name="role"
            label="请选择身份"
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
            name="username"
            label="手机号"
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
            label="密码"
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
            name="remember"
            valuePropName="checked"
            style={{ 
              marginBottom: 24,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Checkbox style={{ margin: 0 }}>记住我</Checkbox>
            <a 
              href="/forgot-password" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
            >
              忘记密码?
            </a>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              style={{ width: '100%', height: 40, marginBottom: 16 }}
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.65)' }}>
            还没有账号? <a 
              href="/register" 
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
            >
              立即注册
            </a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;