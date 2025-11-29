// llf-webview/src/components/CreateTeamModal.tsx

import { type FC } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateTeamModal: FC<CreateTeamModalProps> = ({ open, onClose }) => {
  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    // TODO: Implement submit functionality
    console.log("Submit team");
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
        {/* TODO: Add form fields */}
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
