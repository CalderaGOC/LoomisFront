"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  VStack,
  Text,
  Button,
  Flex,
  Heading,
} from '@chakra-ui/react';

const Navbar = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); // Redirige si no hay token
    }
  }, [router]);

  return (
    <Flex height="100vh">
      {/* Panel lateral */}
      <Box
        width="150px"
        bg="gray.800"
        color="white"
        p={5}
      >
        <Heading size="lg" mb={6}><img src="/logo.jpg" alt="Company Logo" width={100} height={100} />
        </Heading>
        <VStack spacing={4} align="start">
          <Button variant="link" color="white" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
          <Button variant="link" color="white" onClick={() => router.push('/usuarios')}>
            Usuarios
          </Button>
          <Button variant="link" color="white" onClick={() => router.push('/planillas')}>
            Planillas
          </Button>
          <Button variant="link" color="white" onClick={() => router.push('/mensajes')}>
            Mensajes
          </Button>
          <Button variant="link" color="white" onClick={() => router.push('/settings')}>
            Settings
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
};

export default Navbar;
