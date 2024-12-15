import SocketComponent from "@/components/SocketComponent";
import Logo from "@/components/Logo";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Next.js + Socket.IO + Express Test
      </h1>
      <Logo height={40} width={40} />
      <SocketComponent />
    </main>
  );
}
