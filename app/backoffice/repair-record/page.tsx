'use client';

import { useState, useEffect } from 'react';
import Modal from '../../components/modal';
import Swal from 'sweetalert2';
import config from '../../config';
import axios from 'axios';
import dayjs from 'dayjs';

export default function Page() {
    const [devices, setDevices] = useState([]); // here
    const [repairRecords, setRepairRecords] = useState([]); // here

    const [showModal, setShowModal] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [deviceName, setDeviceName] = useState('');
    const [deviceBarcode, setDeviceBarcode] = useState('');
    const [deviceSerial, setDeviceSerial] = useState('');
    const [problem, setProblem] = useState('');
    const [solving, setSolving] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [expireDate, setExpireDate] = useState(''); // here
    const [id, setId] = useState(0);

    //
    // รับเครื่อง
    //
    const [showModalReceive, setShowModalReceive] = useState(false);
    const [receiveCustomerName, setReceiveCustomerName] = useState('');
    const [receiveAmount, setReceiveAmount] = useState(0);
    const [receiveId, setReceiveId] = useState(0);

    useEffect(() => {
        fetchDevices();
        fetchRepairRecords();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await axios.get(`${config.apiUrl}/api/device/all`);
            console.log('Devices fetched:', response.data); // Log the full response to see the structure
    
            // Access the 'results' property and ensure it's an array
            if (Array.isArray(response.data.results)) {
                setDevices(response.data.results); // Update state with the devices array
            } else {
                console.error('Expected results to be an array but got:', response.data.results);
                setDevices([]); // Set empty array if the structure is unexpected
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            setDevices([]); // Set to empty array in case of error
        }
    };
    
    

    const openModal = () => {
        setShowModal(true);
    }

    const closeModal = () => {
        setShowModal(false);
        setId(0);
    }

    const fetchRepairRecords = async () => {
        const response = await axios.get(`${config.apiUrl}/api/repairRecord/list`);
        setRepairRecords(response.data);
    }

const handleDeviceChange = (deviceId: string) => {
    const device = devices.find((device: any) => device.id === parseInt(deviceId));
    if (device) {
        setDeviceId(device.id);
        setDeviceName(device.name);
        setDeviceBarcode(device.barcode);
        setDeviceSerial(device.serial);
        setExpireDate(dayjs(device.expire_date).format('YYYY-MM-DD'));
    } else {
        setDeviceId('');
        setDeviceName('');
        setDeviceBarcode('');
        setDeviceSerial('');
        setExpireDate('');
    }
}

    const handleSave = async () => {
        const payload = {
            customerName: customerName,
            customerPhone: customerPhone,
            deviceId: deviceId == '' ? undefined : deviceId,
            deviceName: deviceName,
            deviceBarcode: deviceBarcode,
            deviceSerial: deviceSerial,
            expireDate: expireDate == '' ? undefined : new Date(expireDate),
            problem: problem,
            solving: solving
        }

        try {
            if (id == 0) {
                await axios.post(`${config.apiUrl}/api/repairRecord/create`, payload);
            } else {
                await axios.put(`${config.apiUrl}/api/repairRecord/update/${id}`, payload);
                setId(0);
            }

            Swal.fire({
                icon: 'success',
                title: 'บันทึกข้อมูล',
                text: 'บันทึกข้อมูลเรียบร้อย',
                timer: 1000
            });

            closeModal();
            fetchRepairRecords();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'error',
                text: error.message,
            });
        }
    }

    const getStatusName = (status: string) => {
        switch (status) {
            case 'active':
                return 'รอซ่อม';
            case 'pending':
                return 'รอลูกค้ายืนยัน';
            case 'repairing':
                return 'กำลังซ่อม';
            case 'done':
                return 'ซ่อมเสร็จ';
            case 'cancel':
                return 'ยกเลิก';
            case 'complete':
                return 'ลูกค้ามารับอุปกรณ์';
            default:
                return 'รอซ่อม';
        }
    }

    const handleEdit = (repairRecord: any) => {
        setId(repairRecord.id);
        setCustomerName(repairRecord.customerName);
        setCustomerPhone(repairRecord.customerPhone);

        if (repairRecord.deviceId) {
            setDeviceId(repairRecord.deviceId);
        }

        setDeviceName(repairRecord.deviceName);
        setDeviceBarcode(repairRecord.deviceBarcode);
        setDeviceSerial(repairRecord.deviceSerial);
        setExpireDate(dayjs(repairRecord.expireDate).format('YYYY-MM-DD'));
        setProblem(repairRecord.problem);
        openModal();
    }

    const handleDelete = async (id: number) => {
        const button = await config.confirmDialog();

        if (button.isConfirmed) {
            await axios.delete(`${config.apiUrl}/api/repairRecord/remove/${id}`);
            fetchRepairRecords();
        }
    }

    const openModalReceive = (repairRecord: any) => {
        setShowModalReceive(true);
        setReceiveCustomerName(repairRecord.customerName);
        setReceiveAmount(0);
        setReceiveId(repairRecord.id);
    }

    const closeModalReceive = () => {
        setShowModalReceive(false);
        setReceiveId(0); // clear id
    }

    const handleReceive = async () => {
        const payload = {
            id: receiveId,
            amount: receiveAmount
        }

        await axios.put(`${config.apiUrl}/api/repairRecord/receive`, payload);

        fetchRepairRecords();
        closeModalReceive();
    }

    return (
        <>
            <div className="card">
                <h1>บันทึกการซ่อม</h1>
                <div className="card-body">
                    <button className="btn-primary" onClick={openModal}>
                        <i className="fa-solid fa-plus mr-3"></i>
                        เพิ่มการซ่อม
                    </button>

                    <table className="table mt-3">
                        <thead>
                            <tr>
                                <th>ชื่อลูกค้า</th>
                                <th>เบอร์โทรศัพท์</th>
                                <th>อุปกรณ์</th>
                                <th>อาการ</th>
                                <th>วันที่รับซ่อม</th>
                                <th>วันที่ซ่อมเสร็จ</th>
                                <th>สถานะ</th>
                                <th className="text-right" style={{ paddingRight: '4px' }}>ค่าบริการ</th>
                                <th style={{ width: '330px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {repairRecords.map((repairRecord: any, index: number) => (
                                <tr key={index}>
                                    <td>{repairRecord.customerName}</td>
                                    <td>{repairRecord.customerPhone}</td>
                                    <td>{repairRecord.deviceName}</td>
                                    <td>{repairRecord.problem}</td>
                                    <td>{dayjs(repairRecord.createdAt).format('DD/MM/YYYY')}</td>
                                    <td>{repairRecord.endJobDate ? dayjs(repairRecord.endJobDate).format('DD/MM/YYYY') : '-'}</td>
                                    <td>{getStatusName(repairRecord.status)}</td>
                                    <td className="text-right">{repairRecord.amount?.toLocaleString('th-TH')}</td>
                                    <td>
                                        <button className="btn-edit" onClick={() => openModalReceive(repairRecord)}>
                                            <i className="fa-solid fa-check mr-3"></i>
                                            รับเครื่อง
                                        </button>
                                        <button className="btn-edit" onClick={() => handleEdit(repairRecord)}>
                                            <i className="fa-solid fa-edit mr-3"></i>
                                            แก้ไข
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(repairRecord.id)}>
                                            <i className="fa-solid fa-trash mr-3"></i>
                                            ลบ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal title="เพิ่มการซ่อม" isOpen={showModal}
                onClose={() => closeModal()} size="xl">
                <div className='flex gap-4'>
                    <div className='w-1/2'>
                        <div>ชื่อลูกค้า</div>
                        <input type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="form-control w-full" />
                    </div>
                    <div className='w-1/2'>
                        <div>เบอร์โทรศัพท์</div>
                        <input type="text"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            className="form-control w-full" />
                    </div>
                </div>

                <div className='mt-4'>ชื่ออุปกรณ์ (ในระบบ)</div>
                <select className="form-control w-full" value={deviceId} onChange={(e) => handleDeviceChange(e.target.value)}>
    <option value="">--- เลือกอุปกรณ์ ---</option>
    {devices.map((device: any) => (
        <option value={device.id} key={`${device.id}-${device.name}`}>
            {device.name}
        </option>
    ))}
</select>


                <div className='mt-4'>ชื่ออุปกรณ์ (นอกระบบ)</div>
                <input type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    className="form-control w-full" />

                <div className="flex gap-4 mt-4">
                    <div className="w-1/2">
                        <div>barcode</div>
                        <input type="text"
                            value={deviceBarcode}
                            onChange={(e) => setDeviceBarcode(e.target.value)}
                            className="form-control w-full" />
                    </div>

                    <div className="w-1/2">
                        <div>serial</div>
                        <input type="text"
                            value={deviceSerial}
                            onChange={(e) => setDeviceSerial(e.target.value)}
                            className="form-control w-full" />
                    </div>
                </div>

                <div className="mt-4">วันหมดประกัน</div>
                <input type="date"
                    value={expireDate}
                    onChange={(e) => setExpireDate(e.target.value)}
                    className="form-control w-full" />

                <div className="mt-4">อาการเสีย</div>
                <textarea className="form-control w-full"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}></textarea>

                <button className='btn-primary mt-4' onClick={handleSave}>
                    <i className="fa-solid fa-check mr-3"></i>
                    บันทึก
                </button>
            </Modal>

            <Modal title="รับเครื่อง" isOpen={showModalReceive}
                onClose={() => closeModalReceive()} size="xl">
                <div className='flex gap-4'>
                    <div className='w-1/2'>
                        <div>ชื่อลูกค้า</div>
                        <input type="text" className="form-control w-full disabled" readOnly
                            value={receiveCustomerName} />
                    </div>
                    <div className='w-1/2'>
                        <div>ค่าบริการ</div>
                        <input type="text" className="form-control w-full text-right"
                            value={receiveAmount}
                            onChange={(e) => setReceiveAmount(Number(e.target.value))} />
                    </div>
                </div>

                <div>
                    <button className='btn-primary mt-4' onClick={handleReceive}>
                        <i className="fa-solid fa-check mr-3"></i>
                        บันทึก
                    </button>
                </div>
            </Modal>
        </>
    );
}