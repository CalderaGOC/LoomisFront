"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  ModalCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  Alert,
  AlertIcon,
  Flex,  
  Box,
} from '@chakra-ui/react';

export default function HomePage() {
  const { isOpen, onOpen, onClose: chakraOnClose } = useDisclosure();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3002/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (data.token && data.user && data.user.nombre) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.user.nombre);
        

        await fetch('http://localhost:3002/usuarios/ultimo_login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`
          }
        });
        router.push('/usuarios');
      } else {
        setErrorMessage(data.message);
        console.error(data.message);
      }
    } catch (error) {
      setErrorMessage('Error durante la autenticación');
      console.error('Error durante la autenticación', error);
    }
  };

  // Limpiar el modal cuando se cierra
  const handleModalClose = () => {
    setUsername(''); // Limpiar el campo de usuario
    setPassword(''); // Limpiar el campo de contraseña
    setErrorMessage(''); // Limpiar cualquier mensaje de error
    chakraOnClose(); // Cerrar el modal
  };

  return (
    <Flex
      height="100vh"
      width="100vw"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      textAlign="center"
    >
      {/* Logo de la empresa */}
      <Box mb={5}>
        <img src="/logo.jpg" alt="Company Logo" width={200} height={200} />
      </Box>

      {/* Botón de login que abre el modal */}
      <Button onClick={onOpen} colorScheme="teal" size="lg">
        Login
      </Button>

      {/* Modal de autenticación */}
      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Iniciar sesión</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {errorMessage && (
              <Alert status="error" mb={4}>
                <AlertIcon />
                {errorMessage}
              </Alert>
            )}
            <FormControl>
              <FormLabel>Usuario</FormLabel>
              <Input
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleLogin}>
              Login
            </Button>
            <Button variant="ghost" onClick={handleModalClose}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
