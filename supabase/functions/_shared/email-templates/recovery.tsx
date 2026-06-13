/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Réinitialisez votre mot de passe {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Réinitialiser votre mot de passe</Heading>
        <Text style={text}>
          Nous avons reçu une demande de réinitialisation de votre mot de passe pour {siteName}. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Réinitialiser le mot de passe
        </Button>
        <Text style={footer}>
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email. Votre mot de passe ne sera pas modifié.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#1a1a1a',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#4a4a4a',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: '#262626',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '6px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
