'use client';

import { useEffect, useState } from 'react';
import {Table,Button,Input,Pagination,Modal,Form,message,Space,Typography,} from 'antd';
import type { Product } from '@/types/product';
import { axiosClient } from '@/lib/axiosClient';

const { Text } = Typography;

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // ===== FETCH DATA =====
  const fetchProducts = async (p = 1, s = '') => {
    setLoading(true);
    try {
      const offset = (p - 1) * limit;
      const resp = await axiosClient.get('/products', {
        params: { page: p, limit, offset, search: s || undefined },
      });
      setData(resp.data.data || []);
      setTotal(resp.data.total || 0);
    } catch {
      message.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts(1, search);
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  useEffect(() => {
    fetchProducts(page, search);
  }, [page]);

  // ====== EDIT HANDLER ======
  const onEdit = (p: Product) => {
    setEditing(p);
    form.setFieldsValue(p);
    setIsModalOpen(true);
  };

  // ====== DELETE HANDLER ======
  const onDelete = async (id: string) => {
    Modal.confirm({
      title: 'Hapus produk?',
      content: 'Apakah Anda yakin ingin menghapus produk ini?',
      okText: 'Ya, hapus',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await axiosClient.delete(`/product?product_id=${id}`);
          message.success('Produk berhasil dihapus');
          fetchProducts(page, search);
        } catch {
          message.error('Gagal menghapus produk');
        }
      },
    });
  };

  // ====== CREATE / EDIT HANDLER ======
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await axiosClient.put('/product', { ...values, product_id: editing.product_id });
        message.success('Produk berhasil diperbarui');
      } else {
        await axiosClient.post('/product', values);
        message.success('Produk berhasil ditambahkan');
      }
      setIsModalOpen(false);
      fetchProducts(page, search);
    } catch {
      message.error('Gagal menyimpan produk');
    }
  };

  // ====== TABLE COLUMNS ======
  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_: unknown, record: Product) => {
        const imageUrl =
          record.product_image?.startsWith('http')
            ? record.product_image
            : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}${record.product_image}`;

        const isValidImage =
          record.product_image && record.product_image.trim() !== '';

        return (
          <Space align="center">
            {isValidImage ? (
              <img
                src={imageUrl}
                alt={record.product_title}
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = 'none';
                  const parent = el.parentNode as HTMLElement;
                  const text = document.createElement('div');
                  text.textContent = 'No Image';
                  text.style.cssText = `
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #eee;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #999;
                    background: #fafafa;
                  `;
                  parent.prepend(text);
                }}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid #eee',
                }}
              />
            ) : (
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  border: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: 12,
                  background: '#fafafa',
                }}
              >
                No Image
              </div>
            )}
            <Text strong>{record.product_title}</Text>
          </Space>
        );
      },
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
      render: (text: string) =>
        text ? (text.length > 60 ? text.slice(0, 60) + '...' : text) : '-',
    },
    {
      title: 'Price',
      dataIndex: 'product_price',
      key: 'product_price',
      render: (v: number) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(v),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Product) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Edit</Button>
          <Button danger onClick={() => onDelete(record.product_id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // ====== RENDER ======
  return (
    <div style={{ padding: 24 }}>
      {/* Search & Create */}
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
  <Space.Compact>
    <Input
      placeholder="Cari produk..."
      onChange={(e) => setSearch(e.target.value)}
      style={{ width: 300 }}
    />
    <Button type="primary">Cari</Button>
  </Space.Compact>

  <Button
    type="primary"
    onClick={() => {
      setEditing(null);
      form.resetFields();
      setIsModalOpen(true);
    }}
  >
    Tambah Produk
  </Button>
</Space>


      {/* Table */}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="product_id"
        pagination={false}
      />

      {/* Pagination */}
      <Pagination
        style={{ marginTop: 16 }}
        current={page}
        total={total}
        pageSize={limit}
        onChange={(p) => setPage(p)}
      />

      {/* Modal (Create / Edit) */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        title={editing ? 'Edit Product' : 'Create Product'}
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => {
            // agar preview langsung berubah
            const img = form.getFieldValue('product_image');
            if (img && img.trim() !== '') form.validateFields(['product_image']);
          }}
        >
          <Form.Item
            name="product_title"
            label="Product Title"
            rules={[{ required: true, message: 'Title wajib diisi' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="product_price"
            label="Price"
            rules={[{ required: true, message: 'Price wajib diisi' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item name="product_description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="product_category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item name="product_image" label="Image URL">
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          {/* Live Preview */}
          {form.getFieldValue('product_image') && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <img
                src={
                  form
                    .getFieldValue('product_image')
                    .startsWith('http')
                    ? form.getFieldValue('product_image')
                    : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''}${form.getFieldValue('product_image')}`
                }
                alt="preview"
                style={{
                  maxWidth: 120,
                  maxHeight: 120,
                  objectFit: 'cover',
                  borderRadius: 8,
                  border: '1px solid #ddd',
                }}
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}
