import dynamic from "next/dynamic";

const AddProductForm = dynamic(() => import ("@/components/manager/sales/AddProduct"), {
// //   ssr: false,
});



export default function EditProductPage() {
  return <AddProductForm />;
}
