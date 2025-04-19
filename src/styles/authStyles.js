import { styled } from '@mui/material/styles';
import { Paper, Container } from '@mui/material';

export const AuthContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const AuthPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  width: '100%',
}));

export const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
})); 