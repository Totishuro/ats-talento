import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from '@/app/components/Sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth()

    // Redirect to sign-in if not authenticated
    if (!session || !session.user) {
        redirect('/auth/signin')
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-20 transition-all duration-300">
                {/* Header with user info */}
                <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0F172A] p-2 rounded-lg">
                                <img src="/LogoBranco.png" className="w-full h-full object-contain" alt="Logo" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">ATS Talento</h1>
                                <p className="text-xs text-slate-500">Painel Administrativo</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-slate-900">{session.user.name}</p>
                                <p className="text-xs text-slate-500">{session.user.email}</p>
                            </div>
                            {session.user.image && (
                                <img
                                    src={session.user.image}
                                    alt="User avatar"
                                    className="w-10 h-10 rounded-full border-2 border-blue-500"
                                />
                            )}
                            <form
                                action={async () => {
                                    "use server"
                                    await signOut({ redirectTo: "/" })
                                }}
                            >
                                <button
                                    type="submit"
                                    className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Sair
                                </button>
                            </form>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main>{children}</main>
            </div>
        </div>
    );
}
