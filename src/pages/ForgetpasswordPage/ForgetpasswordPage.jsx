import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form] = Form.useForm();

  const clearError = () => {
    setErrorMessage('');
  };

  const onFinish = async (values) => {
    clearError();
    setLoading(true);
    try {
      const res = await api.authApi.resetPassword({
        phone: values.phone,
        password: values.password,
        confirm_password: values.confirm
      });
      if (!res._isError) {
        message.success('密码重置成功！即将跳转到登录页');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setErrorMessage(res.message || '重置失败，请重试');
      }
    } catch (err) {
      setErrorMessage(err.message || '重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

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
        height: '600px',
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
                忘记密码
              </h1>
            </div>

            {errorMessage && (
              <div style={{ color: '#f5222d', textAlign: 'center', marginBottom: 16 }}>
                <CloseOutlined onClick={clearError} style={{ cursor: 'pointer', marginRight: 6 }} />
                {errorMessage}
              </div>
            )}

            <Form
              form={form}
              name="forgot_pwd"
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                name="phone"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>手机号</span>}
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入绑定的手机号"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>新密码</span>}
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请设置新密码"
                  size="large"
                  disabled={loading}
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                label={<span style={{ color: '#9C706A', fontWeight: 'bold' }}>确认新密码</span>}
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    }
                  })
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请再次输入新密码"
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
                  重置密码
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center', color: '#9C706A', fontWeight: 'bold' }}>
                <a onClick={() => navigate('/login')} style={{ color: '#345276' }}>返回登录</a>
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

export default ForgotPasswordPage;