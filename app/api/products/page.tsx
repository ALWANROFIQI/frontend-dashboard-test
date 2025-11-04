// app/products/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  InputNumber,
  Space,
  Typography,
  Pagination,
  message,
} from 'antd';

import axiosClient from '@/lib/axiosClient';                         // ✅ pakai alias @/
import { Product, ProductListParams } from '@/types/product';         // ✅
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';                      // ✅
import debounce from 'lodash.debounce';// pastikan file ini ada

const { Title, Text } = Typography;
const { Search } = Input;

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth(); // pastikan context tersedia, jika tidak, hapus dua baris ini

  // table data & pagination
  const [data, setData] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form] = Form.useForm();

  // 🔒 Redirect ke login jika belum login (bonus Firebase)
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const getErrorMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message;
    return String(err);
  };

  const fetchProducts = async (params?: Partial<ProductListParams>) => {
    try {
      setLoading(true);
      const p = params?.page ?? page;
      const l = params?.limit ?? limit;
      const s = params?.search ?? searchTerm;
      const offset = (p - 1) * l;

      const resp = await axiosClient.get('/api/products', {
        params: { page: p, limit: l, offset, search: s || undefined },
      });

      const payload = resp.data;
      setData(payload?.data ?? []);
      setTotal(payload?.total ?? (payload?.data?.length ?? 0));
    } catch (err: unknown) {
      console.error(getErrorMessage(err));
      message.error('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Debounce search input
const handleSearchDebounced = useCallback(
  debounce((val: string) => {
    setPage(1);
    setSearchTerm(val);
  }, 300),
  [setPage, setSearchTerm]
);


  useEffect(() => {
    fetchProducts({ page: 1, limit, search: searchTerm });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, limit]);

  useEffect(() => {
    fetchProducts({ page, limit, search: searchTerm });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // 🧱 Table columns
  const columns = [
    {
      title: 'Product Title',
      dataIndex: 'product_title',
      key: 'product_title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'product_price',
      key: 'product_price',
      render: (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val),
    },
    {
      title: 'Category',
      dataIndex: 'product_category',
      key: 'product_category',
    },
    {
      title: 'Description',
      dataIndex: 'product_description',
      key: 'product_description',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (row: Product) => (
        <Space>
          <Button onClick={() => openEditModal(row)}>Edit</Button>
          <Button danger onClick={() => handleDelete(row.product_id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const openCreateModal = () => {
    setModalType('create');
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalType('edit');
    setEditingProduct(product);
    form.setFieldsValue({
      product_title: product.product_title,
      product_price: product.product_price,
      product_description: product.product_description,
      product_category: product.product_category,
      product_image: product.product_image,
      product_id: product.product_id,
    });
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (modalType === 'create') {
        await axiosClient.post('/api/product', values);
        message.success('Produk berhasil dibuat');
      } else if (modalType === 'edit' && editingProduct) {
        await axiosClient.put('/api/product', {
          ...values,
          product_id: editingProduct.product_id,
        });
        message.success('Produk berhasil diperbarui');
      }

      setIsModalOpen(false);
      fetchProducts({ page: 1, limit, search: searchTerm });
    } catch (err: unknown) {
      console.error(getErrorMessage(err));
      message.error('Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product_id: string) => {
    Modal.confirm({
      title: 'Hapus produk?',
      content: 'Apakah Anda yakin ingin menghapus produk ini?',
      onOk: async () => {
        try {
          setLoading(true);
          const resp = await axiosClient.delete('/api/product', { params: { product_id } });
          if (resp?.status === 200) {
            message.success('Produk berhasil dihapus');
            fetchProducts({ page: 1, limit, search: searchTerm });
          } else {
            message.error('Gagal menghapus produk');
          }
        } catch (err: unknown) {
          console.error(getErrorMessage(err));
          message.error('Gagal menghapus produk');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={3}>Product Management</Title>

        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="Cari produk (title, description, category)..."
            onChange={(e) => handleSearchDebounced(e.target.value)}
            style={{ width: 400 }}
            allowClear
          />
          <Button type="primary" onClick={openCreateModal}>
            Create Product
          </Button>
        </Space>

        <Table
          rowKey="product_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            onChange={(p, pageSize) => {
              setPage(p);
              if (pageSize !== limit) setLimit(pageSize);
            }}
            showSizeChanger
            pageSizeOptions={['5', '10', '20', '50']}
          />
        </div>
      </Space>

      {/* Modal Create/Edit */}
      <Modal
        title={modalType === 'create' ? 'Create Product' : 'Edit Product'}
        open={isModalOpen}
        onCancel={handleModalCancel}
        onOk={handleModalSubmit}
        okText="Save"
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="product_id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="Product Title"
            name="product_title"
            rules={[{ required: true, message: 'Product title is required' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Price"
            name="product_price"
            rules={[{ required: true, message: 'Price is required' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item label="Description" name="product_description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Category" name="product_category">
            <Input />
          </Form.Item>
          <Form.Item label="Image URL" name="product_image">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
