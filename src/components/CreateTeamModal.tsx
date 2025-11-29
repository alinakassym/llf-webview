// llf-webview/src/components/CreateTeamModal.tsx

import { type FC, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateTeamModal: FC<CreateTeamModalProps> = ({ open, onClose }) => {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    // Очищаем ошибку при изменении
    if (nameError) {
      setNameError("");
    }
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError("Название обязательно");
      return false;
    }
    return true;
  };

  const handleClose = () => {
    setName("");
    setNameError("");
    onClose();
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    // TODO: Implement submit functionality
    console.log("Submit team:", { name });
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        Создать команду
        <IconButton
          onClick={handleClose}
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Название команды"
            value={name}
            onChange={handleChange}
            error={Boolean(nameError)}
            helperText={nameError}
            fullWidth
            required
            autoFocus
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTeamModal;
