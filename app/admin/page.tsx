import { getProducts } from "@/lib/products";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata = {
    title: "Admin Portal | Balaji Luxmi",
    description: "Manage products, catalog, and inventory.",
};

export default function AdminPage() {
    const products = getProducts();

    return <AdminDashboard initialProducts={products} />;
}
