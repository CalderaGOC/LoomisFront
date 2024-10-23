"use client";
import { useEffect, useState } from 'react';
import { Box, ChakraProvider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import UserMenu from './components/UserMenu';
import { usePathname } from 'next/navigation'; // Hook para obtener la ruta actual

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Obtén la ruta actual
  const [username, setUsername] = useState<string>('Usuario'); // Estado para el nombre de usuario

  // Verifica si el pathname es la página inicial
  const isRootPage = pathname === '/';
  const showNavBar = !isRootPage; // Solo muestra el NavBar si no es la página de inicio

  // Efecto para cargar el username desde localStorage solo en el lado del cliente
  useEffect(() => {
    // Asegúrate de que el código se ejecuta en el cliente (evita SSR issues)
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setUsername('Usuario'); // Valor por defecto
      }
    }
  }, []);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden' }}> {/* Evitar el overflow horizontal */}
        <ChakraProvider>
          {/* Estructura principal con flex */}
          <Box display="flex" minHeight="100vh" overflow="hidden">
            {/* Navbar a la izquierda */}
            {showNavBar && (
              <Box
                width="140px" // Ajustar ancho del Navbar
                height="100vh"
                position="fixed"
                left="0"
                top="0"
                overflow="hidden" // Evitar overflow en el Navbar
              >
                <Navbar />
              </Box>
            )}

            {/* Contenido principal a la derecha del Navbar */}
            <Box
              flex="1"
              ml={showNavBar ? '110px' : '0'} // Ajustar margen en función del tamaño del Navbar
              p={4}
              maxWidth="calc(100vw - 110px)" // Evitar que el contenido principal exceda el ancho de la pantalla
              overflowX="auto" // Permitir scroll horizontal si fuera necesario
            >
              {/* Solo muestra el UserMenu si no estás en la página raíz */}
              {!isRootPage && (
                <Box position="absolute" top="0" right="0" p={4} zIndex="1">
                  <UserMenu username={username} />
                </Box>
              )}

              {/* Contenido principal */}
              {children}
            </Box>
          </Box>
        </ChakraProvider>
      </body>
    </html>
  );
}
