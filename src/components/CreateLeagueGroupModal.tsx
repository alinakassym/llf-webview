// llf-webview/src/components/CreateLeagueGroupModal.tsx

import { type FC, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface CreateLeagueGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeagueGroupData) => Promise<void>;
}

export interface CreateLeagueGroupData {
  name: string;
  order: number;
}

const CreateLeagueGroupModal: FC<CreateLeagueGroupModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateLeagueGroupData>({
    name: "",
    order: 1,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateLeagueGroupData, string>>
  >({});

  const handleChange =
    (field: keyof CreateLeagueGroupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "name") {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      } else {
        const numValue = Number(e.target.value);
        setFormData((prev) => ({ ...prev, [field]: numValue }));
      }

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateLeagueGroupData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error creating league group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        order: 1,
      });
      setErrors({});
      onClose();
    }
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
            borderRadius: 2,
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
        Создать группу лиг
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Название группы"
            fullWidth
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            required
            autoFocus
          />

          <TextField
            label="Порядок"
            type="number"
            fullWidth
            value={formData.order}
            onChange={handleChange("order")}
            error={!!errors.order}
            helperText={errors.order}
            disabled={loading}
            required
            slotProps={{ htmlInput: { min: 1 } }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? "Создание..." : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLeagueGroupModal;
