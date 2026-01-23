import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined, CloseOutlined, CodeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../service/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [form] = Form.useForm();

  const clearError = () => {
    setErrorMessage('');
  };

  const sendVerifyCode = async () => {
    const phone = form.getFieldValue('phone');
    if (!phone) {
      message.warning('请先输入手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      message.warning('请输入正确的手机号');
      return;
    }

    setCodeLoading(true);
    try {
      const res = await api.authApi.sendVerifyCode(phone);
      if (!res._isError) {
        message.success('验证码已发送（查看后端终端）');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      message.error('发送失败：' + err.message);
    } finally {
      setCodeLoading(false);
    }
  };

  const onFinish = async (values) => {
    clearError();
    setLoading(true);
    try {
      const res = await api.authApi.resetPassword({
        phone: values.phone,
        code: values.code,
        password: values.password,
        confirm: values.confirm
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
      backgroundColor: '#f0f2f5',
      padding: '24px'
    }}>
      <Card style={{ maxWidth: 400, width: '100%', padding: '24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600 }}>忘记密码</h1>
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
            label="手机号"
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
            name="code"
            label="验证码"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input
              prefix={<CodeOutlined />}
              placeholder="请输入6位验证码"
              size="large"
              disabled={loading || codeLoading}
              addonAfter={
                <Button
                  type="link"
                  onClick={sendVerifyCode}
                  disabled={countdown > 0 || loading}
                >
                  {countdown > 0 ? `${countdown}s后重新发送` : '获取验证码'}
                </Button>
              }
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="新密码"
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
            label="确认新密码"
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
              style={{ width: '100%', height: 40 }}
              loading={loading}
            >
              重置密码
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <a onClick={() => navigate('/login')}>返回登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;