// Code generated by protoc-gen-go. DO NOT EDIT.
// source: value.proto

package value

import (
	fmt "fmt"
	proto "github.com/golang/protobuf/proto"
	math "math"
)

// Reference imports to suppress errors if they are not otherwise used.
var _ = proto.Marshal
var _ = fmt.Errorf
var _ = math.Inf

// This is a compile-time assertion to ensure that this generated file
// is compatible with the proto package it is being compiled against.
// A compilation error at this line likely means your copy of the
// proto package needs to be updated.
const _ = proto.ProtoPackageIsVersion3 // please upgrade the proto package

type BigIntegerBuf struct {
	Value                []byte   `protobuf:"bytes,1,opt,name=value,proto3" json:"value,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *BigIntegerBuf) Reset()         { *m = BigIntegerBuf{} }
func (m *BigIntegerBuf) String() string { return proto.CompactTextString(m) }
func (*BigIntegerBuf) ProtoMessage()    {}
func (*BigIntegerBuf) Descriptor() ([]byte, []int) {
	return fileDescriptor_6d8b663a521ecf69, []int{0}
}

func (m *BigIntegerBuf) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_BigIntegerBuf.Unmarshal(m, b)
}
func (m *BigIntegerBuf) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_BigIntegerBuf.Marshal(b, m, deterministic)
}
func (m *BigIntegerBuf) XXX_Merge(src proto.Message) {
	xxx_messageInfo_BigIntegerBuf.Merge(m, src)
}
func (m *BigIntegerBuf) XXX_Size() int {
	return xxx_messageInfo_BigIntegerBuf.Size(m)
}
func (m *BigIntegerBuf) XXX_DiscardUnknown() {
	xxx_messageInfo_BigIntegerBuf.DiscardUnknown(m)
}

var xxx_messageInfo_BigIntegerBuf proto.InternalMessageInfo

func (m *BigIntegerBuf) GetValue() []byte {
	if m != nil {
		return m.Value
	}
	return nil
}

type HashBuf struct {
	Value                []byte   `protobuf:"bytes,1,opt,name=value,proto3" json:"value,omitempty"`
	XXX_NoUnkeyedLiteral struct{} `json:"-"`
	XXX_unrecognized     []byte   `json:"-"`
	XXX_sizecache        int32    `json:"-"`
}

func (m *HashBuf) Reset()         { *m = HashBuf{} }
func (m *HashBuf) String() string { return proto.CompactTextString(m) }
func (*HashBuf) ProtoMessage()    {}
func (*HashBuf) Descriptor() ([]byte, []int) {
	return fileDescriptor_6d8b663a521ecf69, []int{1}
}

func (m *HashBuf) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_HashBuf.Unmarshal(m, b)
}
func (m *HashBuf) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_HashBuf.Marshal(b, m, deterministic)
}
func (m *HashBuf) XXX_Merge(src proto.Message) {
	xxx_messageInfo_HashBuf.Merge(m, src)
}
func (m *HashBuf) XXX_Size() int {
	return xxx_messageInfo_HashBuf.Size(m)
}
func (m *HashBuf) XXX_DiscardUnknown() {
	xxx_messageInfo_HashBuf.DiscardUnknown(m)
}

var xxx_messageInfo_HashBuf proto.InternalMessageInfo

func (m *HashBuf) GetValue() []byte {
	if m != nil {
		return m.Value
	}
	return nil
}

type OperationBuf struct {
	OpCode               uint32    `protobuf:"varint,1,opt,name=opCode,proto3" json:"opCode,omitempty"`
	Immediate            *ValueBuf `protobuf:"bytes,2,opt,name=immediate,proto3" json:"immediate,omitempty"`
	XXX_NoUnkeyedLiteral struct{}  `json:"-"`
	XXX_unrecognized     []byte    `json:"-"`
	XXX_sizecache        int32     `json:"-"`
}

func (m *OperationBuf) Reset()         { *m = OperationBuf{} }
func (m *OperationBuf) String() string { return proto.CompactTextString(m) }
func (*OperationBuf) ProtoMessage()    {}
func (*OperationBuf) Descriptor() ([]byte, []int) {
	return fileDescriptor_6d8b663a521ecf69, []int{2}
}

func (m *OperationBuf) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_OperationBuf.Unmarshal(m, b)
}
func (m *OperationBuf) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_OperationBuf.Marshal(b, m, deterministic)
}
func (m *OperationBuf) XXX_Merge(src proto.Message) {
	xxx_messageInfo_OperationBuf.Merge(m, src)
}
func (m *OperationBuf) XXX_Size() int {
	return xxx_messageInfo_OperationBuf.Size(m)
}
func (m *OperationBuf) XXX_DiscardUnknown() {
	xxx_messageInfo_OperationBuf.DiscardUnknown(m)
}

var xxx_messageInfo_OperationBuf proto.InternalMessageInfo

func (m *OperationBuf) GetOpCode() uint32 {
	if m != nil {
		return m.OpCode
	}
	return 0
}

func (m *OperationBuf) GetImmediate() *ValueBuf {
	if m != nil {
		return m.Immediate
	}
	return nil
}

type CodePointBuf struct {
	Pc                   int64         `protobuf:"varint,1,opt,name=pc,proto3" json:"pc,omitempty"`
	Op                   *OperationBuf `protobuf:"bytes,2,opt,name=op,proto3" json:"op,omitempty"`
	NextHash             *HashBuf      `protobuf:"bytes,3,opt,name=nextHash,proto3" json:"nextHash,omitempty"`
	XXX_NoUnkeyedLiteral struct{}      `json:"-"`
	XXX_unrecognized     []byte        `json:"-"`
	XXX_sizecache        int32         `json:"-"`
}

func (m *CodePointBuf) Reset()         { *m = CodePointBuf{} }
func (m *CodePointBuf) String() string { return proto.CompactTextString(m) }
func (*CodePointBuf) ProtoMessage()    {}
func (*CodePointBuf) Descriptor() ([]byte, []int) {
	return fileDescriptor_6d8b663a521ecf69, []int{3}
}

func (m *CodePointBuf) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_CodePointBuf.Unmarshal(m, b)
}
func (m *CodePointBuf) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_CodePointBuf.Marshal(b, m, deterministic)
}
func (m *CodePointBuf) XXX_Merge(src proto.Message) {
	xxx_messageInfo_CodePointBuf.Merge(m, src)
}
func (m *CodePointBuf) XXX_Size() int {
	return xxx_messageInfo_CodePointBuf.Size(m)
}
func (m *CodePointBuf) XXX_DiscardUnknown() {
	xxx_messageInfo_CodePointBuf.DiscardUnknown(m)
}

var xxx_messageInfo_CodePointBuf proto.InternalMessageInfo

func (m *CodePointBuf) GetPc() int64 {
	if m != nil {
		return m.Pc
	}
	return 0
}

func (m *CodePointBuf) GetOp() *OperationBuf {
	if m != nil {
		return m.Op
	}
	return nil
}

func (m *CodePointBuf) GetNextHash() *HashBuf {
	if m != nil {
		return m.NextHash
	}
	return nil
}

type TupleBuf struct {
	Values               []*ValueBuf `protobuf:"bytes,1,rep,name=values,proto3" json:"values,omitempty"`
	XXX_NoUnkeyedLiteral struct{}    `json:"-"`
	XXX_unrecognized     []byte      `json:"-"`
	XXX_sizecache        int32       `json:"-"`
}

func (m *TupleBuf) Reset()         { *m = TupleBuf{} }
func (m *TupleBuf) String() string { return proto.CompactTextString(m) }
func (*TupleBuf) ProtoMessage()    {}
func (*TupleBuf) Descriptor() ([]byte, []int) {
	return fileDescriptor_6d8b663a521ecf69, []int{4}
}

func (m *TupleBuf) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_TupleBuf.Unmarshal(m, b)
}
func (m *TupleBuf) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_TupleBuf.Marshal(b, m, deterministic)
}
func (m *TupleBuf) XXX_Merge(src proto.Message) {
	xxx_messageInfo_TupleBuf.Merge(m, src)
}
func (m *TupleBuf) XXX_Size() int {
	return xxx_messageInfo_TupleBuf.Size(m)
}
func (m *TupleBuf) XXX_DiscardUnknown() {
	xxx_messageInfo_TupleBuf.DiscardUnknown(m)
}

var xxx_messageInfo_TupleBuf proto.InternalMessageInfo

func (m *TupleBuf) GetValues() []*ValueBuf {
	if m != nil {
		return m.Values
	}
	return nil
}

type ValueBuf struct {
	Type uint32 `protobuf:"varint,1,opt,name=type,proto3" json:"type,omitempty"`
	// Types that are valid to be assigned to Value:
	//	*ValueBuf_IntVal
	//	*ValueBuf_TupleVal
	//	*ValueBuf_CodePointVal
	Value                isValueBuf_Value `protobuf_oneof:"value"`
	XXX_NoUnkeyedLiteral struct{}         `json:"-"`
	XXX_unrecognized     []byte           `json:"-"`
	XXX_sizecache        int32            `json:"-"`
}

func (m *ValueBuf) Reset()         { *m = ValueBuf{} }
func (m *ValueBuf) String() string { return proto.CompactTextString(m) }
func (*ValueBuf) ProtoMessage()    {}
func (*ValueBuf) Descriptor() ([]byte, []int) {
	return fileDescriptor_6d8b663a521ecf69, []int{5}
}

func (m *ValueBuf) XXX_Unmarshal(b []byte) error {
	return xxx_messageInfo_ValueBuf.Unmarshal(m, b)
}
func (m *ValueBuf) XXX_Marshal(b []byte, deterministic bool) ([]byte, error) {
	return xxx_messageInfo_ValueBuf.Marshal(b, m, deterministic)
}
func (m *ValueBuf) XXX_Merge(src proto.Message) {
	xxx_messageInfo_ValueBuf.Merge(m, src)
}
func (m *ValueBuf) XXX_Size() int {
	return xxx_messageInfo_ValueBuf.Size(m)
}
func (m *ValueBuf) XXX_DiscardUnknown() {
	xxx_messageInfo_ValueBuf.DiscardUnknown(m)
}

var xxx_messageInfo_ValueBuf proto.InternalMessageInfo

func (m *ValueBuf) GetType() uint32 {
	if m != nil {
		return m.Type
	}
	return 0
}

type isValueBuf_Value interface {
	isValueBuf_Value()
}

type ValueBuf_IntVal struct {
	IntVal *BigIntegerBuf `protobuf:"bytes,2,opt,name=intVal,proto3,oneof"`
}

type ValueBuf_TupleVal struct {
	TupleVal *TupleBuf `protobuf:"bytes,3,opt,name=tupleVal,proto3,oneof"`
}

type ValueBuf_CodePointVal struct {
	CodePointVal *CodePointBuf `protobuf:"bytes,4,opt,name=codePointVal,proto3,oneof"`
}

func (*ValueBuf_IntVal) isValueBuf_Value() {}

func (*ValueBuf_TupleVal) isValueBuf_Value() {}

func (*ValueBuf_CodePointVal) isValueBuf_Value() {}

func (m *ValueBuf) GetValue() isValueBuf_Value {
	if m != nil {
		return m.Value
	}
	return nil
}

func (m *ValueBuf) GetIntVal() *BigIntegerBuf {
	if x, ok := m.GetValue().(*ValueBuf_IntVal); ok {
		return x.IntVal
	}
	return nil
}

func (m *ValueBuf) GetTupleVal() *TupleBuf {
	if x, ok := m.GetValue().(*ValueBuf_TupleVal); ok {
		return x.TupleVal
	}
	return nil
}

func (m *ValueBuf) GetCodePointVal() *CodePointBuf {
	if x, ok := m.GetValue().(*ValueBuf_CodePointVal); ok {
		return x.CodePointVal
	}
	return nil
}

// XXX_OneofWrappers is for the internal use of the proto package.
func (*ValueBuf) XXX_OneofWrappers() []interface{} {
	return []interface{}{
		(*ValueBuf_IntVal)(nil),
		(*ValueBuf_TupleVal)(nil),
		(*ValueBuf_CodePointVal)(nil),
	}
}

func init() {
	proto.RegisterType((*BigIntegerBuf)(nil), "value.BigIntegerBuf")
	proto.RegisterType((*HashBuf)(nil), "value.HashBuf")
	proto.RegisterType((*OperationBuf)(nil), "value.OperationBuf")
	proto.RegisterType((*CodePointBuf)(nil), "value.CodePointBuf")
	proto.RegisterType((*TupleBuf)(nil), "value.TupleBuf")
	proto.RegisterType((*ValueBuf)(nil), "value.ValueBuf")
}

func init() { proto.RegisterFile("value.proto", fileDescriptor_6d8b663a521ecf69) }

var fileDescriptor_6d8b663a521ecf69 = []byte{
	// 342 bytes of a gzipped FileDescriptorProto
	0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x02, 0xff, 0x74, 0x92, 0xd1, 0x6f, 0xaa, 0x30,
	0x14, 0xc6, 0x05, 0xbc, 0xc8, 0x3d, 0xa2, 0x37, 0xe9, 0x35, 0x0b, 0x6f, 0x33, 0x2c, 0x46, 0xb3,
	0x44, 0x4c, 0xe6, 0xd3, 0x5e, 0xd9, 0x0b, 0x7b, 0xda, 0xd2, 0x6c, 0x3e, 0xec, 0xad, 0x60, 0xd1,
	0x26, 0x40, 0x1b, 0x2c, 0x66, 0xfb, 0xf3, 0xf6, 0x9f, 0x2d, 0xad, 0xc5, 0x49, 0xb2, 0xbd, 0x10,
	0x4e, 0xcf, 0xef, 0x7c, 0xf9, 0xce, 0xd7, 0xc2, 0xf0, 0x48, 0x8a, 0x86, 0x46, 0xa2, 0xe6, 0x92,
	0xa3, 0x3f, 0xba, 0x08, 0x67, 0x30, 0x8a, 0xd9, 0xee, 0xb1, 0x92, 0x74, 0x47, 0xeb, 0xb8, 0xc9,
	0xd1, 0x04, 0x4e, 0x9d, 0xc0, 0x9a, 0x5a, 0x0b, 0x1f, 0x1b, 0xec, 0x1a, 0x06, 0x09, 0x39, 0xec,
	0x7f, 0x07, 0x5e, 0xc1, 0x7f, 0x12, 0xb4, 0x26, 0x92, 0xf1, 0x4a, 0x51, 0x57, 0xe0, 0x72, 0xf1,
	0xc0, 0xb7, 0x27, 0x6c, 0x84, 0x4d, 0x85, 0x96, 0xf0, 0x97, 0x95, 0x25, 0xdd, 0x32, 0x22, 0x69,
	0x60, 0x4f, 0xad, 0xc5, 0xf0, 0xee, 0x5f, 0x74, 0xf2, 0xb5, 0x51, 0xdf, 0xb8, 0xc9, 0xf1, 0x37,
	0x11, 0x72, 0xf0, 0xd5, 0xd8, 0x33, 0x67, 0x95, 0x54, 0xb2, 0x63, 0xb0, 0x45, 0xa6, 0x25, 0x1d,
	0x6c, 0x8b, 0x0c, 0xdd, 0x80, 0xcd, 0x85, 0xd1, 0xf9, 0x6f, 0x74, 0x2e, 0x7d, 0x60, 0x9b, 0x0b,
	0x74, 0x0b, 0x5e, 0x45, 0xdf, 0xa5, 0x5a, 0x20, 0x70, 0x34, 0x3a, 0x36, 0xa8, 0xd9, 0x09, 0x9f,
	0xfb, 0xe1, 0x1a, 0xbc, 0x97, 0x46, 0x14, 0xca, 0x07, 0x9a, 0x83, 0xab, 0xb1, 0x43, 0x60, 0x4d,
	0x9d, 0x9f, 0x8c, 0x9a, 0x76, 0xf8, 0x69, 0x81, 0xd7, 0x1e, 0x22, 0x04, 0x7d, 0xf9, 0x21, 0xda,
	0xbd, 0xf5, 0x3f, 0x8a, 0xc0, 0x65, 0x95, 0xdc, 0x90, 0xc2, 0x58, 0x9d, 0x18, 0xa5, 0x4e, 0xf4,
	0x49, 0x0f, 0x1b, 0x0a, 0x2d, 0xc1, 0x93, 0xca, 0x85, 0x9a, 0x70, 0x3a, 0x21, 0xb5, 0xe6, 0x92,
	0x1e, 0x3e, 0x23, 0xe8, 0x1e, 0xfc, 0xac, 0x4d, 0x49, 0x8d, 0xf4, 0x3b, 0x79, 0x5c, 0x06, 0x98,
	0xf4, 0x70, 0x07, 0x8d, 0x07, 0xe6, 0x36, 0xe3, 0xf9, 0xdb, 0x6c, 0xc7, 0xe4, 0xbe, 0x49, 0xa3,
	0x8c, 0x97, 0x2b, 0x9e, 0xe7, 0xd9, 0x9e, 0xb0, 0xaa, 0x20, 0xe9, 0x61, 0x45, 0xea, 0x74, 0x49,
	0x8e, 0xe5, 0x4a, 0x83, 0xa9, 0xab, 0xdf, 0xcf, 0xfa, 0x2b, 0x00, 0x00, 0xff, 0xff, 0x55, 0x97,
	0x2c, 0xb6, 0x4e, 0x02, 0x00, 0x00,
}
