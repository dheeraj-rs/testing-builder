import AuthLayout from "@/core/layouts/AuthLayout";

export default function HomePage() {
    return (
        <AuthLayout>
            <div className="w-full h-full flex items-center justify-center">
                <h1 className="text-5xl font-bold">Welcome to D Admin</h1>
            </div>
        </AuthLayout>
    );
}