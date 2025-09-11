"use client";

import { supabase, type Filieres } from "@/app/lib/supabaseConfig";
import ConfirmDialog from "../components/ui/dialog";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Edit3,
  PlayCircle,
  ChevronDown,
  Download,
  Eye,
  BookOpen,
  Users,
  Bell,
  Search,
  Menu,
  X,
  FileText,
  GraduationCap,
  BookMarked,
  PenTool,
  Plus,
  LogOut,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Filter,
  FolderOpen,
  TrendingUp,
  Target,
  Award,
  Settings,
  SquareActivity,
  Video,
} from "lucide-react";

interface User {
  id: string;
  nom: string;
  fonction: string;
  nomEcole: string;
  email: string;
  telephone: string;
  status: string;
}

interface Course {
  id: string;
  nom: string;
  description: string;
  module_id: string;
  author: string;
  duration: number;
  date_creation: string;
}

interface Module {
  image_url: string | Blob | undefined;
  id: string;
  nom: string;
  description: string;
  duration: number;
  author: string;
  filiere_ids?: number[]; // integer au lieu de string[]
  firebase_uid: string;
  date_creation: string;
  nombre_cours: number;
  filieres?: Filieres[]; // Pour l'affichage
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "cours" | "chapitre" | "exercice";
  date: string;
  time: string;
  description: string;
}

// Interface Section à ajouter avec vos autres interfaces
interface Section {
  id: string;
  nom: string;
  description?: string;
  ordre: number;
  cours_id: string;
  created_by: string;
  pdf_url?: string;
  video_url?: string;
  has_pdf: boolean;
  has_video: boolean;
  created_at: string;
}

interface Exercise {
  id: string;
  nom: string;
  description?: string;
  type: "pdf" | "qcm" | "qro";
  section_id: string;
  created_by: string;
  created_at: string;

  // Pour exercices PDF
  pdf_url?: string;

  // Pour QCM et QRO
  duree_minutes?: number;
  note_sur?: number;
}

interface ExerciseWithDetails extends Exercise {
  questions_count?: number;
}

interface Question {
  id: string;
  texte: string;
  ordre: number;
  type: "qcm" | "qro";

  // Pour QCM uniquement
  options?: Option[];
  multiple_answers?: boolean; // Plusieurs réponses correctes autorisées
}

interface Option {
  id: string;
  texte: string;
  ordre: number;
  is_correct: boolean;
}

interface ExerciseFormData {
  nom: string;
  description: string;
  duree_minutes: number;
  note_sur: number;
  pdf_file: File | null;
  questions: Question[];
}

const Dashboard = () => {
  // États existants (conservés intégralement)
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeMainTab, setActiveMainTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // State pour l'édition de module
  const [showEditModuleForm, setShowEditModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editModuleForm, setEditModuleForm] = useState({
    image_url: null as File | null,
    nom: "",
    author: "",
    duration: 0,
    description: "",
    filieres: [] as string[],
  });
  // ...déclaration des useState...
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [moduleForm, setModuleForm] = useState({
    image_url: null as File | null,
    nom: "",
    description: "",
    author: "",
    duration: 0,
    filières: [] as string[],
  });
  // Charger les modules dès que l'utilisateur est disponible
  useEffect(() => {
    if (user?.id) {
      loadModulesForUser(user.id);
    }
  }, [user]);

  // Les filières disponibles sont celles de la BD
  const [filieres, setFilieres] = useState<Filieres[]>([]);
  const [loadingFilieres, setLoadingFilieres] = useState(false);
  const [showFiliereForm, setShowFiliereForm] = useState(false);
  const [filiereForm, setFiliereForm] = useState({ nom: "", description: " " });
  const [showEditFiliereForm, setShowEditFiliereForm] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState<Filieres | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseForm, setCourseForm] = useState({
    nom: "",
    description: "",
    author: "",
    duration: 0,
    module_id: "",
  });
  const [editFiliereForm, setEditFiliereForm] = useState({
    nom: "",
    description: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filiereToDelete, setFiliereToDelete] = useState<Filieres | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showEditCourseForm, setShowEditCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseForm, setEditCourseForm] = useState({
    nom: "",
    description: "",
    author: "",
    duration: 0,
    module_id: "",
  });
  const [selectedModuleForCourse, setSelectedModuleForCourse] =
    useState<string>("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [filteredFiliere, setFilteredFiliere] = useState<string | null>(null);
  const [showAllModules, setShowAllModules] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [sectionForm, setSectionForm] = useState({
    nom: "",
    description: "",
    ordre: 1,
    cours_id: "",
    pdf_file: null as File | null,
    video_file: null as File | null,
  });
  const [uploadingSection, setUploadingSection] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseSectionCounts, setCourseSectionCounts] = useState<
    Record<string, number>
  >({});
  const [collapsedSections, setCollapsedSections] = useState(new Set());
  const [showEditSectionForm, setShowEditSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [editSectionForm, setEditSectionForm] = useState({
    nom: "",
    description: "",
    ordre: 1,
    cours_id: "",
    pdf_file: null,
    video_file: null,
  });
  const [showExerciseForm, setShowExerciseForm] = useState<boolean>(false);
  const [selectedSectionForExercise, setSelectedSectionForExercise] =
    useState<Section | null>(null);
  const [exerciseType, setExerciseType] = useState<
    "pdf" | "qcm" | "qro" | null
  >(null);
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>({
    nom: "",
    description: "",
    duree_minutes: 30,
    note_sur: 20,
    pdf_file: null,
    questions: [],
  });
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState<boolean>(false);

  const router = useRouter();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("userData");

        if (!token || !userData) {
          router.push("/form/login");
          return;
        }

        const tokenData = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if (tokenData.exp < currentTime) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          router.push("/form/login");
          return;
        }

        // Charger les données utilisateur D'ABORD
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // PUIS charger les filières une fois que user est défini
        if (parsedUser?.id) {
          await loadFilieresForUser(parsedUser.id);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/form/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedCourse?.id) {
      console.log("Cours sélectionné changé:", selectedCourse);
      loadSectionsForCourse(selectedCourse.id);
    } else {
      setSections([]); // Vider les sections si aucun cours sélectionné
    }
  }, [selectedCourse]);

  // Fonction de chargement avec ID en paramètre
  const loadFilieresForUser = async (userId: string) => {
    try {
      setLoadingFilieres(true);
      // Charger les filières depuis Supabase pour l'utilisateur donné et empecher que les autres écoles voient les filières des autres
      const { data, error } = await supabase
        .from("filieres")
        .select("*")
        .eq("firebase_uid", userId) //Filtrer par l'ID de l'utilisateur pour personnaliser les filières
        .order("created_at", { ascending: true });
      console.log("Filières chargées:", data);

      if (error) {
        console.error("Erreur lors du chargement des filières:", error);
        return;
      }

      setFilieres(data || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingFilieres(false);
    }
  };

    // AJOUTEZ ICI le nouveau useEffect :
  useEffect(() => {
  if (sections.length > 0) {
    loadAllExercises();
  }
}, [sections]);

  // Fonction de déconnexion
  const handleLogout = () => {
    if (confirm("Êtes-vous sûr de vouloir vous déconnectez ?")) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      router.push("/form/login");
    }
  };

  // Fonction pour gérer les paramètres de compte
  const handleAccountSettings = () => {
    // Rediriger vers les paramètres du compte
    console.log("Redirection vers les paramètres du compte");
  };
  // Gestion des filières dans le formulaire
  const handleFilièreToggle = (filière: string) => {
    setModuleForm((prev) => ({
      ...prev,
      filières: prev.filières.includes(filière)
        ? prev.filières.filter((f) => f !== filière)
        : [...prev.filières, filière],
    }));
  };

  // Supprimer un module avec son image
  const handleDeleteModule = async (moduleId: string) => {
    if (!user?.id) {
      alert("Erreur d'authentification");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return;

    try {
      // 1️⃣ Récupérer le module pour connaître l'image
      const { data: moduleData, error: fetchError } = await supabase
        .from("modules")
        .select("image_url")
        .eq("id", moduleId)
        .single();

      if (fetchError) {
        console.error("Erreur lors de la récupération du module:", fetchError);
        alert("Impossible de récupérer le module");
        return;
      }

      // 2️⃣ Supprimer l'image si elle existe
      if (moduleData?.image_url) {
        const { error: storageError } = await supabase.storage
          .from("module_img")
          .remove([moduleData.image_url]); // juste le nom du fichier
        if (storageError)
          console.warn("Erreur suppression image:", storageError.message);
      }

      // 3️⃣ Supprimer le module dans la table
      const { error: deleteError } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId)
        .eq("firebase_uid", user.id);

      if (deleteError) {
        console.error("Erreur lors de la suppression du module:", deleteError);
        alert("Erreur lors de la suppression du module");
        return;
      }

      // 4️⃣ Recharger les modules
      await loadModulesForUser(user.id);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression du module");
    }
  };

  //Fonction d'upload d'image
  const uploadImage = async (file: File) => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from("module_img")
      .upload(filePath, file);

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from("module_img").getPublicUrl(filePath);

    return publicUrl;
  };

  // Charger les modules depuis Supabase
  const loadModulesForUser = async (userId: string) => {
    try {
      setLoadingModules(true);

      // 1. Récupérer les modules avec leurs filières
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select(
          `
        *,
        module_filieres(
          filieres(*)
        )
      `
        )
        .eq("firebase_uid", userId)
        .order("created_at", { ascending: false });

      if (modulesError) throw modulesError;

      // 2. Pour chaque module, compter ses cours
      const modulesWithCounts = await Promise.all(
        modulesData.map(async (module: any) => {
          const { count, error: countError } = await supabase
            .from("cours")
            .select("*", { count: "exact", head: true })
            .eq("module_id", module.id);

          if (countError) {
            console.error("Erreur comptage cours:", countError);
          }

          return {
            ...module,
            filieres: module.module_filieres.map(
              (mf: { filieres: Filieres }) => mf.filieres
            ),
            filiere_ids: module.module_filieres.map(
              (mf: { filieres: Filieres }) => mf.filieres.id
            ),
            nombre_cours: count || 0,
          };
        })
      );

      setModules(modulesWithCounts);
    } catch (error) {
      console.error("Erreur chargement modules:", error);
    } finally {
      setLoadingModules(false);
    }
  };

  // Créer un module dans Supabase
  const handleCreateModuleDB = async () => {
    if (!moduleForm.nom.trim() || !moduleForm.description.trim()) {
      alert("Veuillez remplir le nom et la description du module");
      return;
    }

    if (moduleForm.filières.length === 0) {
      alert("Veuillez sélectionner au moins une filière");
      return;
    }

    if (!user?.id) {
      alert("Erreur d'authentification");
      return;
    }

    try {
      setUploading(true);

      // Upload de l'image si présente
      let imageUrl = null;
      if (moduleForm.image_url) {
        imageUrl = await uploadImage(moduleForm.image_url);
      }

      // Créer le module avec l'URL de l'image
      const { data: moduleData, error: moduleError } = await supabase
        .from("modules")
        .insert([
          {
            nom: moduleForm.nom.trim(),
            author: moduleForm.author.trim(),
            duration: moduleForm.duration,
            description: moduleForm.description.trim(),
            firebase_uid: user.id,
            image_url: imageUrl,
          },
        ])
        .select()
        .single();

      if (moduleError) throw moduleError;

      // Reste de votre logique existante pour les filières...
      const filiereAssociations = moduleForm.filières
        .map((nomFiliere) => {
          const filiere = filieres.find((f) => f.nom === nomFiliere);
          return {
            module_id: moduleData.id,
            filiere_id: filiere?.id,
          };
        })
        .filter((assoc) => assoc.filiere_id);

      if (filiereAssociations.length > 0) {
        const { error: associationError } = await supabase
          .from("module_filieres")
          .insert(filiereAssociations);

        if (associationError) throw associationError;
      }

      await loadModulesForUser(user.id);

      setModuleForm({
        nom: "",
        description: "",
        author: "",
        duration: 0,
        filières: [],
        image_url: null,
      });
      setShowModuleForm(false);

      console.log("✅ Module créé avec succès");
    } catch (error) {
      console.error("Erreur création module:", error);
      alert("Erreur lors de la création du module");
    } finally {
      setUploading(false);
    }
  };

  // Fonction pour créer une filière
  const handleCreateFiliere = async () => {
    if (!filiereForm.nom.trim()) {
      alert("Veuillez saisir le nom de la filière");
      return;
    }

    if (!user?.id) {
      alert("Erreur d'authentification");
      return;
    }

    // Vérifier si la filière existe déjà (par nom, pour cette école)
    if (filieres.some((f) => f.nom === filiereForm.nom.trim())) {
      alert("Cette filière existe déjà");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("filieres")
        .insert([
          {
            nom: filiereForm.nom.trim(),
            description: filiereForm.description?.trim() || null,
            firebase_uid: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          alert("Cette filière existe déjà");
        } else {
          console.error("Erreur lors de la création:", error);
          alert("Erreur lors de la création de la filière");
        }
        return;
      }

      // Ajouter la nouvelle filière à la liste locale
      setFilieres([...filieres, data]);
      setFiliereForm({ nom: "", description: "" });
      setShowFiliereForm(false);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la création de la filière");
    }
  };

  // Supprimer une filière
  const handleDeleteFiliere = (filiereId: string | number) => {
    const filiere = filieres.find((f) => f.id === filiereId);
    if (!filiere) {
      // Si tu veux, affiche un toast custom ici
      console.error("Filière introuvable");
      return;
    }
    setFiliereToDelete(filiere);
    setConfirmOpen(true);
  };

  // Exécute la suppression après confirmation
  const confirmDeleteFiliere = async () => {
    if (!filiereToDelete) return;

    try {
      const { error } = await supabase
        .from("filieres")
        .delete()
        .eq("id", filiereToDelete.id)
        .eq("firebase_uid", user?.id);

      if (error) {
        console.error("Erreur suppression:", error);
        // Ici tu peux ouvrir un autre petit dialog d'erreur si tu veux
        return;
      }

      // État local
      setFilieres(filieres.filter((f) => f.id !== filiereToDelete.id));

      // Nettoie les modules qui référencent la filière
      setModules(
        modules.map((module) => ({
          ...module,
          filieres:
            module.filieres?.filter((f) => f.nom !== filiereToDelete.nom) || [],
        }))
      );
    } finally {
      setConfirmOpen(false);
      setFiliereToDelete(null);
    }
  };

  //Editer une filière
  const handleEditFiliere = (filiere: Filieres) => {
    setEditingFiliere(filiere);
    setEditFiliereForm({
      nom: filiere.nom,
      description: filiere.description || "",
    });
    setShowEditFiliereForm(true);
  };

  //Mettre à jour une filière
  const handleUpdateFiliere = async () => {
    if (!editFiliereForm.nom.trim()) {
      alert("Veuillez saisir le nom de la filière");
      return;
    }

    if (!editingFiliere?.id) {
      alert("Erreur : filière introuvable");
      return;
    }

    // Vérifier si le nouveau nom existe déjà (sauf si c'est le même)
    if (
      editFiliereForm.nom.trim() !== editingFiliere.nom &&
      filieres.some((f) => f.nom === editFiliereForm.nom.trim())
    ) {
      alert("Ce nom de filière existe déjà");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("filieres")
        .update({
          nom: editFiliereForm.nom.trim(),
          description: editFiliereForm.description?.trim() || null,
        })
        .eq("id", editingFiliere.id)
        .eq("firebase_uid", user?.id)
        .select()
        .single();

      if (error) {
        console.error("Erreur mise à jour:", error);
        alert("Erreur lors de la modification de la filière");
        return;
      }

      // Mettre à jour l'état local
      setFilieres(filieres.map((f) => (f.id === editingFiliere.id ? data : f)));

      // Si le nom a changé, mettre à jour les modules associés
      // Si le nom a changé, mettre à jour les modules associés
      if (data.nom !== editingFiliere.nom) {
        setModules(
          modules.map((module) => ({
            ...module,
            filieres:
              module.filieres?.map((f) =>
                f.nom === editingFiliere.nom ? { ...f, nom: data.nom } : f
              ) || [],
          }))
        );
      }

      // Fermer le modal
      setShowEditFiliereForm(false);
      setEditingFiliere(null);
      setEditFiliereForm({ nom: "", description: "" });

      console.log("✅ Filière modifiée:", data);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la modification de la filière");
    }
  };

  const handleConsulterModules = (filiere: Filieres) => {
    setActiveTab("mes-modules");
    setFilteredFiliere(filiere.nom);
  };

  const handleConsulterCours = (module: Module) => {
    setActiveTab("mes-cours");
    setFilteredFiliere(module.nom);
  };

  const handleConsulterSection = async (course: Course) => {
    setActiveTab("mes-sections");
    setSelectedCourse(course);
    if (course?.id) {
      await loadSectionsForCourse(course.id);
    }
  };

  // 4. Fonctions utilitaires avec types
  const getFilePublicUrl = (
    bucket: string,
    fileName: string | null
  ): string | null => {
    if (!fileName) return null;

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return data.publicUrl;
  };

  const getPdfUrl = (section: Section): string | null => {
    return getFilePublicUrl("section_pdfs", section.pdf_url ?? null);
  };

  const getVideoUrl = (section: Section): string | null => {
    return getFilePublicUrl("section_videos", section.video_url ?? null);
  };

  const handleDownloadFile = (url: string | null, filename: string): void => {
    if (!url) return;

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteSection = async (sectionId: string): Promise<void> => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette section ?")) return;

    try {
      // 1. Récupérer les infos de la section
      const { data: sectionData, error: fetchError } = await supabase
        .from("sections")
        .select("pdf_url, video_url, cours_id")
        .eq("id", sectionId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Supprimer les fichiers du storage
      const deletePromises: Promise<any>[] = [];
      if (sectionData.pdf_url) {
        deletePromises.push(
          supabase.storage.from("section_pdfs").remove([sectionData.pdf_url])
        );
      }
      if (sectionData.video_url) {
        deletePromises.push(
          supabase.storage
            .from("section_videos")
            .remove([sectionData.video_url])
        );
      }

      await Promise.all(deletePromises);

      // 3. Supprimer la section de la base de données
      const { error: deleteError } = await supabase
        .from("sections")
        .delete()
        .eq("id", sectionId);

      if (deleteError) throw deleteError;

      // 4. Recharger les sections
      if (selectedCourse?.id) {
        await loadSectionsForCourse(selectedCourse.id);
      }

      console.log("✅ Section supprimée avec succès");
    } catch (error: unknown) {
      console.error("Erreur suppression section:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      alert(`Erreur lors de la suppression de la section: ${errorMessage}`);
    }
  };

  // 3. Ajoutez cet useEffect pour charger les cours quand l'utilisateur est disponible
  useEffect(() => {
    if (user?.id) {
      loadAllCoursesForUser(user.id);
    }
  }, [user]);

  // 4. Modifiez handleCreateCourse pour recharger tous les cours
  const handleCreateCourse = async () => {
    const { nom, description, author, duration, module_id } = courseForm;

    if (
      !nom.trim() ||
      !description.trim() ||
      !author.trim() ||
      !duration ||
      !module_id
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!user?.id) {
      alert("Erreur d'authentification");
      return;
    }

    try {
      const { error } = await supabase.from("cours").insert([
        {
          nom: nom.trim(),
          description: description.trim(),
          author: author.trim(),
          duration,
          module_id,
        },
      ]);

      if (error) throw error;

      // Recharger tous les cours et modules
      await loadAllCoursesForUser(user.id);
      await loadModulesForUser(user.id);

      // Réinitialiser le formulaire
      setCourseForm({
        nom: "",
        description: "",
        author: "",
        duration: 0,
        module_id: "",
      });
      setShowCourseForm(false);

      console.log("✅ Cours créé avec succès");
    } catch (error) {
      console.error("Erreur création cours:", error);
      alert("Erreur lors de la création du cours");
    }
  };

  // 5. Fonction pour éditer un cours
  const handleUpdateCourse = async () => {
    if (
      !editCourseForm.nom.trim() ||
      !editCourseForm.description.trim() ||
      !editCourseForm.author.trim() ||
      !editCourseForm.duration
    ) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    if (!editingCourse?.id || !user?.id) {
      alert("Erreur lors de la modification");
      return;
    }

    try {
      const { error } = await supabase
        .from("cours")
        .update({
          nom: editCourseForm.nom.trim(),
          description: editCourseForm.description.trim(),
          author: editCourseForm.author.trim(),
          duration: editCourseForm.duration,
          module_id: editCourseForm.module_id,
        })
        .eq("id", editingCourse.id);

      if (error) throw error;

      // Recharger les cours
      await loadAllCoursesForUser(user.id);

      // Fermer le modal
      setShowEditCourseForm(false);
      setEditingCourse(null);
      setEditCourseForm({
        nom: "",
        description: "",
        author: "",
        duration: 0,
        module_id: "",
      });

      console.log("✅ Cours modifié avec succès");
    } catch (error) {
      console.error("Erreur modification cours:", error);
      alert("Erreur lors de la modification du cours");
    }
  };

  // 6. Fonction pour supprimer un cours (mise à jour)
  const handleDeleteCourse = async (courseId: string) => {
    if (!user?.id) {
      alert("Erreur d'authentification");
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      try {
        const { error } = await supabase
          .from("cours")
          .delete()
          .eq("id", courseId);

        if (error) throw error;

        // Recharger tous les cours
        await loadAllCoursesForUser(user.id);
        console.log("✅ Cours supprimé avec succès");
      } catch (error) {
        console.error("Erreur suppression cours:", error);
        alert("Erreur lors de la suppression du cours");
      }
    }
  };

  // 7. Fonction pour gérer l'édition d'un cours
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditCourseForm({
      nom: course.nom,
      description: course.description,
      author: course.author,
      duration: course.duration,
      module_id: course.module_id,
    });
    setShowEditCourseForm(true);
  };

  // 8. Fonction pour obtenir le nom du module à partir de son ID
  const getModuleName = (moduleId: string) => {
    const module = modules.find((m) => m.id === moduleId);
    return module?.nom || "Module inconnu";
  };

  const getFileName = (url: String) => {
    if (!url) return null;
    // Extraire le nom du fichier depuis l'URL ou le chemin
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    // Supprimer le timestamp et l'ID aléatoire ajoutés lors de l'upload
    const cleanName = fileName.replace(/^\d+_[a-z0-9]+\./, "");
    return cleanName || fileName;
  };

  const getPdfFileName = (section: Section) => {
    if (!section.pdf_url) return null;
    return getFileName(section.nom + ".pdf") || "undefined.pdf";
  };

  const getVideoFileName = (section: Section) => {
    if (!section.video_url) return null;
    return getFileName(section.nom + ".mp4") || "undefined.mp4";
  };

  const loadAllCoursesForUser = async (userId: string) => {
    try {
      setLoadingCourses(true);
      const { data, error } = await supabase
        .from("cours")
        .select(
          `
              *,
              modules!inner(
                nom,
                firebase_uid
              )
            `
        )
        .eq("modules.firebase_uid", userId)
        .order("date_creation", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Erreur chargement cours:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Format utilitaire pour date et heure
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return (
      date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) +
      " à " +
      date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
  };
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Lundi = 0
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Rendu du calendrier
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthYear = currentDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    const days = [];
    const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    // Jours vides au début
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();

      days.push(
        <button
          key={day}
          onClick={() =>
            setSelectedDate(
              new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            )
          }
          className={`h-10 w-10 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 ${
            isToday(day)
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : isSelected
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="bg-white rounded-md border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 capitalize">
            {monthYear}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">{days}</div>

        {selectedDate && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-900">
              Date sélectionnée: {formatDate(selectedDate)}
            </p>
            <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
              Programmer un contenu
            </button>
          </div>
        )}
      </div>
    );
  };

  // Affichage pendant le chargement initial
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  // Si l'utilisateur n'est pas défini, ne rien rendre
  if (!user) {
    return null;
  }

  // Configuration des onglets

  const mainTabs = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Users,
    },
    {
      id: "cours-modules",
      name: "Formation",
      icon: BookOpen,
      subTabs: [
        { id: "filieres", name: "Filières", icon: Target },
        { id: "mes-modules", name: "Modules", icon: BookMarked },
        { id: "mes-cours", name: "Cours", icon: GraduationCap },
      ],
    },
    {
      id: "etudiants",
      name: "Étudiants",
      icon: Users,
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: TrendingUp,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
    },
  ];

  // États vides améliorés
  const emptyStates = {
    dashboard: {
      title: "Organisez vos formations",
      description:
        "Structurez vos cours et modules pour une meilleure gestion pédagogique.",
      cta: "Dashboard",
      icon: SquareActivity,
    },
    filieres: {
      title: "Organisez vos filières",
      description:
        "Créez et gérez les spécialités de votre établissement pour structurer vos formations.",
      cta: "Créer une filière",
      icon: Target,
    },
    "mes-modules": {
      title: "Vos premiers modules",
      description:
        "Regroupez vos cours par thématiques pour une meilleure organisation pédagogique.",
      cta: "Créer un module",
      icon: BookMarked,
    },
    "mes-cours": {
      title: "Développez vos cours",
      description:
        "Créez des contenus pédagogiques structurés et engageants pour vos étudiants.",
      cta: "Créer un cours",
      icon: GraduationCap,
    },
    "mes-sections": {
      title: "Structurez vos contenus",
      description:
        "Organisez vos cours en sections pour un apprentissage progressif.",
      cta: "Créer une section",
      icon: FileText,
    },
    "mes-exercices": {
      title: "Évaluez les compétences",
      description:
        "Créez des exercices pratiques pour valider les acquis de vos étudiants.",
      cta: "Créer un exercice",
      icon: PenTool,
    },
    etudiants: {
      title: "Gérez vos étudiants",
      description:
        "Invitez et organisez vos étudiants par filières et formations.",
      cta: "Inviter des étudiants",
      icon: Users,
    },
    analytics: {
      title: "Analysez les performances",
      description: "Suivez les progrès et l'engagement de vos étudiants.",
      cta: "Voir les statistiques",
      icon: TrendingUp,
    },
    notifications: {
      title: "Restez informé",
      description:
        "Configurez vos notifications pour ne rien manquer d'important.",
      cta: "Configurer",
      icon: Bell,
    },
  };

  const getCurrentEmptyState = () => {
    if (activeMainTab === "cours-modules") {
      return (
        emptyStates[activeTab as keyof typeof emptyStates] ??
        emptyStates["mes-modules"]
      );
    }
    return (
      emptyStates[activeMainTab as keyof typeof emptyStates] ??
      emptyStates["filieres"]
    );
  };

  const renderDashboardOverview = () => (
    <div className="space-y-8">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6  transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Modules
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {modules.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BookMarked className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          {/*<p className="text-xs text-slate-500 mt-2">+2 ce mois</p>*/}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6  transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Cours</p>
              <p className="text-3xl font-bold text-slate-900">
                {courses.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">+5 ce mois</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6  transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Filières</p>
              <p className="text-3xl font-bold text-slate-900">
                {filieres.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Actives</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6  transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Étudiants</p>
              <p className="text-3xl font-bold text-slate-900">247</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">+12 ce mois</p>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowModuleForm(true)}
            className="flex items-center p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-indigo-100 rounded-md flex items-center justify-center mr-3">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Créer un module</p>
              <p className="text-sm text-slate-500">
                Nouveau contenu de formation
              </p>
            </div>
          </button>

          <button className="flex items-center p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-left">
            <div className="w-10 h-10 bg-emerald-100 rounded-md flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">
                Inviter des étudiants
              </p>
              <p className="text-sm text-slate-500">Étendre votre audience</p>
            </div>
          </button>

          <button
            className="flex items-center p-4 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-left"
            onClick={() => setShowFiliereForm(true)}
          >
            <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Nouvelle filière</p>
              <p className="text-sm text-slate-500">Organiser vos formations</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modules récents */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Modules récents
          </h2>
          <button
            onClick={() => {
              setActiveMainTab("cours-modules");
              setActiveTab("mes-modules");
            }}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-3">
          {modules.slice(0, 3).map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-3 border border-slate-100 rounded-md hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center text-white font-semibold text-sm mr-3">
                  {module.nom.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{module.nom}</p>
                  <p className="text-sm text-slate-500">
                    {module.nombre_cours} cours • {module.duration}h
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {module.filieres?.slice(0, 2).map((filiere, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                  >
                    {filiere.nom}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModulesContent = () => (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Modules de formation
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos contenus pédagogiques par thématiques
          </p>
        </div>
        <button
          onClick={() => setShowModuleForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Nouveau module
        </button>
      </div>

      {modules.length === 0 ? (
        /* État vide */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BookMarked className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Créez votre premier module
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Regroupez vos cours par thématiques pour une meilleure organisation
            pédagogique.
          </p>
          <button
            onClick={() => setShowModuleForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Créer un module
          </button>
        </div>
      ) : (
        /* Grille responsive des modules avec images */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="bg-white border border-gray-200 rounded-md overflow-hidden hover:border-blue-200 transition-all"
            >
              {/* Image d'en-tête */}
              <div className="relative h-48 bg-blue-600 mx-3 mt-3 rounded-md overflow-hidden group">
                {/* Overlay avec pattern */}
                <div className="absolute inset-0 bg-black/20 "></div>

                {/* Vous pouvez remplacer ce gradient par une vraie image */}
                {module.image_url ? (
                  <img
                    src={module.image_url}
                    alt={`Module ${module.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Image par défaut avec pattern */
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/80">
                      <BookMarked size={48} />
                    </div>
                  </div>
                )}

                {/* Badge du nombre de cours */}
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                    {module.nombre_cours || 0} cours
                  </span>
                </div>

                {/* Menu actions en overlay (optionnel) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button
                      className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      onClick={() => {
                        setEditingModule(module);
                        setEditModuleForm({
                          image_url: (module.image_url as File) ?? null,
                          nom: module.nom,
                          author: module.author,
                          duration: module.duration,
                          description: module.description,
                          filieres: module.filieres
                            ? module.filieres.map((f) => f.nom)
                            : [],
                        });
                        setShowEditModuleForm(true);
                      }}
                      title="Modifierr le module"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      title="Supprimer le module"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-6">
                {/* Titre et métadonnées */}
                <h3 className="font-semibold text-gray-900 mb-2 text-lg line-clamp-2">
                  {module.nom}
                </h3>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">
                  {module.description}
                </p>

                {/* Statistiques */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{module.duration} heures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>Par {module.author}</span>
                  </div>
                </div>

                {/* Tags des filières */}
                {module.filieres && module.filieres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {module.filieres.slice(0, 2).map((filiere, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {filiere.nom}
                      </span>
                    ))}
                    {module.filieres.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                        +{module.filieres.length - 2}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions - Même style que les filières */}
                <div className="pt-4 border-t border-gray-100">
                  {/* Actions hiérarchisées */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-purple-50 text-purple-500 hover:bg-purple-100 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      title="Consulter les modules"
                      onClick={() => handleConsulterCours(module)}
                    >
                      <BookOpen size={16} />
                      Voir les cours associés
                    </button>

                    <button
                      className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      onClick={() => {
                        setEditingModule(module);
                        setEditModuleForm({
                          image_url: (module.image_url as File) ?? null,
                          nom: module.nom,
                          author: module.author,
                          duration: module.duration,
                          description: module.description,
                          filieres: module.filieres
                            ? module.filieres.map((f) => f.nom)
                            : [],
                        });
                        setShowEditModuleForm(true);
                      }}
                      title="Modifier le module"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer la filière"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFilieresContent = () => {
    return (
      <div>
        {/* Si aucune filière, afficher l'état vide */}
        {filieres.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Aucune filière créée
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Créez vos premières filières pour organiser vos modules et cours
              par spécialité. Chaque filière peut contenir plusieurs modules.
            </p>
            <button
              onClick={() => setShowFiliereForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={18} />
              Créer une filière
            </button>
          </div>
        ) : (
          /* Si des filières existent, les afficher */
          <div className="space-y-8">
            {/* Header section */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des Filières
                </h1>
                <p className="text-gray-600 mt-1">
                  Organisez vos filières et visualisez les modules associés
                </p>
              </div>
              <button
                onClick={() => setShowFiliereForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus size={18} />
                Nouvelle filière
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filieres.map((filiere) => {
                // Calcul des modules associés (gardé tel quel)
                const modulesAssocie = modules.filter(
                  (module) =>
                    module.filieres?.some((f) => f.nom === filiere.nom) || false
                ).length;

                return (
                  <div
                    key={filiere.id}
                    className="bg-white rounded-md border border-gray-200 overflow-hidden transition-all duration-200 hover:border-blue-200 py-3"
                  >
                    {/* Header avec gradient plus subtil */}
                    <div className="h-10 bg-white relative">
                      <div className="absolute -bottom-6 left-6">
                        <div className="w-12 h-12 bg-blue-600 rounded-md flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {filiere.nom.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contenu avec padding uniforme */}
                    <div className="pt-10 p-6">
                      <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                        {filiere.nom}
                      </h3>

                      {filiere.description && (
                        <p
                          className="text-gray-600 text-sm mb-4 overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {filiere.description}
                        </p>
                      )}

                      {/* Stats avec icônes cohérentes */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-2">
                          <BookMarked size={16} />
                          <span>
                            {modulesAssocie} module
                            {modulesAssocie !== 1 ? "s" : ""}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users size={16} />
                          <span>0 étudiants</span>
                        </span>
                      </div>

                      {/* Actions hiérarchisées */}
                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-purple-50 text-purple-500 hover:bg-purple-100 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                          onClick={() => handleConsulterModules(filiere)}
                          title="Consulter les modules"
                        >
                          <FolderOpen size={16} />
                          Voir les modules associés
                        </button>

                        <button
                          className="p-2.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          onClick={() => handleEditFiliere(filiere)}
                          title="Modifier la filière"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteFiliere(filiere.id)}
                          className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Supprimer la filière"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoursesContent = () => (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Cours disponibles
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez vos contenus pédagogiques et leurs sections
          </p>
        </div>
        <button
          onClick={() => setShowCourseForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Nouveau cours
        </button>
      </div>
      {courses.length === 0 ? (
        /* État vide */
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Créez votre premier cours
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Développez des contenus pédagogiques structurés et engageants pour
            vos étudiants.
          </p>
          <button
            onClick={() => setShowCourseForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Créer un cours
          </button>
        </div>
      ) : (
        /* Liste des cours - Layout en liste enrichie */
        <div className="space-y-3">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 rounded-md  hover:border-blue-200 transition-all"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  {/* Contenu principal */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="flex-1 min-w-0">
                      {/* Titre et module */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg truncate">
                          {course.nom}
                        </h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md self-start sm:self-auto flex-shrink-0">
                          {getModuleName(course.module_id)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Métadonnées */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {course.duration}h
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          Par {course.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDateTime(course.date_creation)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions verticales à droite */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {/* Entrer dans le cours (sections/exercices) */}
                    <button
                      className="flex-1 bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      onClick={() => handleConsulterSection(course)}
                    >
                      <FileText size={16} />(
                      {courseSectionCounts[course.id] || 0})
                    </button>

                    {/* Modifier le cours */}
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors group flex items-center justify-center"
                      title="Modifier les informations du cours"
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Supprimer le cours */}
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors group flex items-center justify-center"
                      title="Supprimer le cours"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Barre de progression / stats en bas */}
              <div className="px-5 pb-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>0 section • 0 exercice</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Publié
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  //Fonction pour ouvrir le modal de choix d'exercice
  const handleAddExercice = (section: Section): void => {
    setSelectedSectionForExercise(section);
    setExerciseType(null);
    setShowExerciseForm(true);
  };

  //Fonction pour choisir le type d'exercice
  const selectExerciseType = (type: "pdf" | "qcm" | "qro"): void => {
    setExerciseType(type);
    setExerciseForm({
      nom: "",
      description: "",
      duree_minutes: type === "pdf" ? 0 : 30,
      note_sur: type === "pdf" ? 0 : 20,
      pdf_file: null,
      questions: [],
    });
  };

  //Fonctions de gestion des questions QCM

  const addQCMQuestion = (): void => {
    const newQuestion: Question = {
      id: `temp_${Date.now()}`,
      texte: "",
      ordre: exerciseForm.questions.length + 1,
      type: "qcm",
      options: [
        {
          id: `temp_opt_${Date.now()}_1`,
          texte: "",
          ordre: 1,
          is_correct: false,
        },
        {
          id: `temp_opt_${Date.now()}_2`,
          texte: "",
          ordre: 2,
          is_correct: false,
        },
      ],
      multiple_answers: false,
    };

    setExerciseForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQCMQuestion = (
    questionIndex: number,
    field: keyof Question,
    value: any
  ): void => {
    setExerciseForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === questionIndex ? { ...q, [field]: value } : q
      ),
    }));
  };

  const addQCMOption = (questionIndex: number): void => {
    setExerciseForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) => {
        if (idx === questionIndex && q.options) {
          const newOption: Option = {
            id: `temp_opt_${Date.now()}`,
            texte: "",
            ordre: q.options.length + 1,
            is_correct: false,
          };
          return { ...q, options: [...q.options, newOption] };
        }
        return q;
      }),
    }));
  };

  const updateQCMOption = (
    questionIndex: number,
    optionIndex: number,
    field: keyof Option,
    value: any
  ): void => {
    setExerciseForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qIdx) => {
        if (qIdx === questionIndex && q.options) {
          return {
            ...q,
            options: q.options.map((opt, oIdx) =>
              oIdx === optionIndex ? { ...opt, [field]: value } : opt
            ),
          };
        }
        return q;
      }),
    }));
  };

  //Fonctions de gestion des questions QRO
  const addQROQuestion = (): void => {
    const newQuestion: Question = {
      id: `temp_${Date.now()}`,
      texte: "",
      ordre: exerciseForm.questions.length + 1,
      type: "qro",
    };

    setExerciseForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQROQuestion = (questionIndex: number, texte: string): void => {
    setExerciseForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === questionIndex ? { ...q, texte } : q
      ),
    }));
  };

  //Fonction pour supprimer une question
  const removeQuestion = (questionIndex: number): void => {
    setExerciseForm((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((_, idx) => idx !== questionIndex)
        .map((q, idx) => ({ ...q, ordre: idx + 1 })),
    }));
  };
  // Fonction principale pour créer une section
  const handleCreateSection = async () => {
    const { nom, description, ordre, cours_id, pdf_file, video_file } =
      sectionForm;

    // Validation des champs obligatoires
    if (!nom.trim()) {
      alert("Le nom de la section est obligatoire");
      return;
    }

    if (!cours_id) {
      alert("Veuillez sélectionner un cours");
      return;
    }

    if (!user?.id) {
      alert("Erreur d'authentification");
      return;
    }

    // Déclarer les variables dans la bonne portée
    let pdfUrl: string | null = null;
    let videoUrl: string | null = null;

    try {
      setUploadingSection(true);

      // 1. Vérifier que le cours appartient bien à l'utilisateur
      const { data: courseData, error: courseError } = await supabase
        .from("cours")
        .select(
          `
        id, 
        modules!inner(firebase_uid)
      `
        )
        .eq("id", cours_id)
        .eq("modules.firebase_uid", user.id)
        .single();

      if (courseError || !courseData) {
        throw new Error("Cours non trouvé ou non autorisé");
      }

      // 2. Upload du PDF si présent
      if (pdf_file) {
        console.log("Upload du PDF en cours...");
        const pdfResult = await uploadFile(pdf_file, "section_pdfs", "pdfs/");
        if (pdfResult) {
          pdfUrl = pdfResult.fileName;
          console.log("PDF uploadé:", pdfUrl);
        }
      }

      // 3. Upload de la vidéo si présente
      if (video_file) {
        console.log("Upload de la vidéo en cours...");
        const videoResult = await uploadFile(
          video_file,
          "section_videos",
          "videos/"
        );
        if (videoResult) {
          videoUrl = videoResult.fileName;
          console.log("Vidéo uploadée:", videoUrl);
        }
      }

      // 4. Créer la section dans la base de données
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .insert([
          {
            nom: nom.trim(),
            description: description?.trim() || null,
            ordre: ordre,
            cours_id: cours_id,
            created_by: user.id,
            pdf_url: pdfUrl,
            video_url: videoUrl,
            has_pdf: !!pdf_file,
            has_video: !!video_file,
          },
        ])
        .select()
        .single();

      if (sectionError) {
        throw sectionError;
      }

      console.log("✅ Section créée avec succès:", sectionData);

      // 5. Recharger les sections pour le cours actuel
      if (selectedCourse?.id === cours_id) {
        await loadSectionsForCourse(cours_id);
      }

      // 6. Mettre à jour le cours sélectionné si ce n'est pas déjà fait
      if (!selectedCourse || selectedCourse.id !== cours_id) {
        const newSelectedCourse = courses.find((c) => c.id === cours_id);
        setSelectedCourse(newSelectedCourse || null);
      }

      // 7. Réinitialiser le formulaire et fermer le modal
      setSectionForm({
        nom: "",
        description: "",
        ordre: 1,
        cours_id: "",
        pdf_file: null,
        video_file: null,
      });
      setShowSectionForm(false);

      console.log("✅ Section créée et interface mise à jour");
    } catch (error) {
      console.error("Erreur lors de la création de la section:", error);

      // Nettoyage en cas d'erreur : supprimer les fichiers uploadés
      const cleanupPromises = [];

      if (pdfUrl) {
        cleanupPromises.push(
          supabase.storage.from("section_pdfs").remove([pdfUrl])
        );
      }

      if (videoUrl) {
        cleanupPromises.push(
          supabase.storage.from("section_videos").remove([videoUrl])
        );
      }

      // Exécuter le nettoyage sans bloquer l'affichage de l'erreur
      if (cleanupPromises.length > 0) {
        Promise.all(cleanupPromises).catch((cleanupError) =>
          console.error("Erreur lors du nettoyage:", cleanupError)
        );
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      alert(`Erreur lors de la création de la section: ${errorMessage}`);
    } finally {
      setUploadingSection(false);
    }
  };

  // 2. Fonctions pour gérer l'état des sections
  const toggleSection = (sectionId: String) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const isSectionCollapsed = (sectionId: String) => {
    return collapsedSections.has(sectionId);
  };

  const uploadFile = async (file: File, bucket: String, folder = "") => {
    if (!file) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}${Date.now()}_${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(`Erreur upload vers ${bucket}:`, error);
      throw error;
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    return {
      fileName: fileName,
      publicUrl: publicUrl,
    };
  };

  //Fonction pour créer l'exercice
  const handleCreateExercise = async (): Promise<void> => {
    if (!exerciseForm.nom.trim() || !selectedSectionForExercise) {
      await loadAllExercises();
      alert("Veuillez remplir le nom de l'exercice");
      return;
    }

    // Validation spécifique selon le type
    if (exerciseType === "pdf" && !exerciseForm.pdf_file) {
      alert("Veuillez sélectionner un fichier PDF");
      return;
    }

    if (
      (exerciseType === "qcm" || exerciseType === "qro") &&
      exerciseForm.questions.length === 0
    ) {
      alert("Veuillez ajouter au moins une question");
      return;
    }

    try {
      setUploading(true);

      let pdfUrl: string | null = null;

      // Upload du PDF si c'est un exercice PDF
      if (exerciseType === "pdf" && exerciseForm.pdf_file) {
        const pdfResult = await uploadFile(
          exerciseForm.pdf_file,
          "exercise_pdfs",
          "exercises/"
        );
        if (pdfResult) {
          pdfUrl = pdfResult.fileName;
        }
      }

      // Créer l'exercice principal
      const { data: exerciseData, error: exerciseError } = await supabase
        .from("exercises")
        .insert([
          {
            nom: exerciseForm.nom.trim(),
            description: exerciseForm.description?.trim() || null,
            type: exerciseType,
            section_id: selectedSectionForExercise.id,
            created_by: user.id,
            pdf_url: pdfUrl,
            duree_minutes:
              exerciseType !== "pdf" ? exerciseForm.duree_minutes : null,
            note_sur: exerciseType !== "pdf" ? exerciseForm.note_sur : null,
          },
        ])
        .select()
        .single();

      if (exerciseError) throw exerciseError;

      // Créer les questions si c'est un QCM ou QRO
      if (
        (exerciseType === "qcm" || exerciseType === "qro") &&
        exerciseForm.questions.length > 0
      ) {
        const questionsToInsert = exerciseForm.questions.map((q) => ({
          exercise_id: exerciseData.id,
          texte: q.texte,
          ordre: q.ordre,
          type: q.type,
          multiple_answers: q.multiple_answers || false,
        }));

        const { data: questionsData, error: questionsError } = await supabase
          .from("exercise_questions")
          .insert(questionsToInsert)
          .select();

        if (questionsError) throw questionsError;

        // Créer les options pour les QCM
        if (exerciseType === "qcm") {
          const optionsToInsert: any[] = [];

          exerciseForm.questions.forEach((question, qIdx) => {
            const questionId = questionsData[qIdx].id;

            question.options?.forEach((option) => {
              optionsToInsert.push({
                question_id: questionId,
                texte: option.texte,
                ordre: option.ordre,
                is_correct: option.is_correct,
              });
            });
          });

          if (optionsToInsert.length > 0) {
            const { error: optionsError } = await supabase
              .from("exercise_options")
              .insert(optionsToInsert);

            if (optionsError) throw optionsError;
          }
        }
      }

      // Réinitialiser et fermer
      setExerciseForm({
        nom: "",
        description: "",
        duree_minutes: 30,
        note_sur: 20,
        pdf_file: null,
        questions: [],
      });
      setExerciseType(null);
      setSelectedSectionForExercise(null);
      setShowExerciseForm(false);

      // Recharger les sections si nécessaire
      if (selectedCourse?.id) {
        await loadSectionsForCourse(selectedCourse.id);
      }

      console.log("✅ Exercice créé avec succès");
    } catch (error: unknown) {
      console.error("Erreur création exercice:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      alert(`Erreur lors de la création de l'exercice: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const loadExercisesForSection = async (
    sectionId: string
  ): Promise<Exercise[]> => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select(
          `
        *,
        exercise_questions(count)
      `
        )
        .eq("section_id", sectionId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map((exercise) => ({
        ...exercise,
        questions_count: exercise.exercise_questions?.[0]?.count || 0,
      }));
    } catch (error) {
      console.error("Erreur chargement exercices:", error);
      return [];
    }
  };

  // 4. Fonction pour charger tous les exercices des sections visibles
  const loadAllExercises = async (): Promise<void> => {
    if (sections.length === 0) return;

    try {
      setLoadingExercises(true);
      const sectionIds = sections.map((s) => s.id);

      const { data, error } = await supabase
        .from("exercises")
        .select(
          `
        *,
        exercise_questions(count)
      `
        )
        .in("section_id", sectionIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const exercisesWithCount = data.map((exercise) => ({
        ...exercise,
        questions_count: exercise.exercise_questions?.[0]?.count || 0,
      }));

      setExercises(exercisesWithCount);
    } catch (error) {
      console.error("Erreur chargement exercices:", error);
    } finally {
      setLoadingExercises(false);
    }
  };

  // 6. Fonction pour obtenir les exercices d'une section
  const getExercisesForSection = (sectionId: string): ExerciseWithDetails[] => {
    return exercises.filter((ex) => ex.section_id === sectionId);
  };

  // 7. Fonction pour supprimer un exercice
  const handleDeleteExercise = async (exerciseId: string): Promise<void> => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) return;

    try {
      // Récupérer l'exercice pour supprimer le fichier PDF si nécessaire
      const { data: exerciseData, error: fetchError } = await supabase
        .from("exercises")
        .select("pdf_url")
        .eq("id", exerciseId)
        .single();

      if (fetchError) throw fetchError;

      // Supprimer le fichier PDF si il existe
      if (exerciseData.pdf_url) {
        await supabase.storage
          .from("exercise_pdfs")
          .remove([exerciseData.pdf_url]);
      }

      // Supprimer l'exercice (les questions et options seront supprimées en cascade)
      const { error: deleteError } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exerciseId);

      if (deleteError) throw deleteError;

      // Recharger les exercices
      await loadAllExercises();

      console.log("✅ Exercice supprimé avec succès");
    } catch (error) {
      console.error("Erreur suppression exercice:", error);
      alert("Erreur lors de la suppression de l'exercice");
    }
  };

  // 8. Fonction pour obtenir l'URL du PDF d'exercice
  const getExercisePdfUrl = (exercise: Exercise): string | null => {
    if (!exercise.pdf_url) return null;
    return getFilePublicUrl("exercice_pdfs", exercise.pdf_url);
  };

  // 9. Fonction pour télécharger un exercice PDF
  const handleDownloadExercise = (exercise: Exercise): void => {
    const pdfUrl = getExercisePdfUrl(exercise);
    if (pdfUrl) {
      handleDownloadFile(pdfUrl, `${exercise.nom}.pdf`);
    }
  };

  //Modal JSX/TSX - À ajouter après vos autres modaux
  {
    showExerciseForm && selectedSectionForExercise && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {!exerciseType
                  ? "Créer un exercice"
                  : `Créer un exercice ${exerciseType.toUpperCase()}`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Section: {selectedSectionForExercise.nom}
              </p>
            </div>
            <button
              onClick={() => {
                setShowExerciseForm(false);
                setExerciseType(null);
                setSelectedSectionForExercise(null);
              }}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {!exerciseType ? (
              /* Sélection du type d'exercice */
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Quel type d'exercice souhaitez-vous créer ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Choisissez le format qui convient le mieux à votre contenu
                    pédagogique.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Option PDF */}
                  <button
                    onClick={() => selectExerciseType("pdf")}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                      <FileText size={24} className="text-red-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Exercice PDF
                    </h4>
                    <p className="text-sm text-gray-600">
                      Uploadez un document PDF contenant vos exercices, devoirs
                      ou cas pratiques.
                    </p>
                  </button>

                  {/* Option QCM */}
                  <button
                    onClick={() => selectExerciseType("qcm")}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                      <CheckCircle size={24} className="text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      QCM Interactif
                    </h4>
                    <p className="text-sm text-gray-600">
                      Créez des questions à choix multiples avec réponses
                      correctes prédéfinies.
                    </p>
                  </button>

                  {/* Option QRO */}
                  <button
                    onClick={() => selectExerciseType("qro")}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                      <Edit3 size={24} className="text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Questions Ouvertes
                    </h4>
                    <p className="text-sm text-gray-600">
                      Posez des questions ouvertes nécessitant des réponses
                      rédigées par les étudiants.
                    </p>
                  </button>
                </div>
              </div>
            ) : (
              /* Formulaire selon le type choisi */
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'exercice *
                    </label>
                    <input
                      type="text"
                      value={exerciseForm.nom}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setExerciseForm({
                          ...exerciseForm,
                          nom: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Exercices chapitre 1, Quiz de révision..."
                    />
                  </div>

                  {exerciseType !== "pdf" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseForm.duree_minutes}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setExerciseForm({
                            ...exerciseForm,
                            duree_minutes: parseInt(e.target.value) || 30,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnelle)
                  </label>
                  <textarea
                    rows={3}
                    value={exerciseForm.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setExerciseForm({
                        ...exerciseForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    placeholder="Instructions ou contexte pour les étudiants..."
                  />
                </div>

                {exerciseType !== "pdf" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note sur
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={exerciseForm.note_sur}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setExerciseForm({
                          ...exerciseForm,
                          note_sur: parseInt(e.target.value) || 20,
                        })
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Contenu spécifique selon le type */}
                {exerciseType === "pdf" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fichier PDF de l'exercice *
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === "application/pdf") {
                          setExerciseForm({ ...exerciseForm, pdf_file: file });
                        } else if (file) {
                          alert("Veuillez sélectionner un fichier PDF valide");
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    {exerciseForm.pdf_file && (
                      <p className="text-sm text-gray-600 mt-2">
                        Fichier sélectionné: {exerciseForm.pdf_file.name}
                      </p>
                    )}
                  </div>
                )}

                {exerciseType === "qcm" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Questions QCM
                      </h3>
                      <button
                        onClick={addQCMQuestion}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Ajouter une question
                      </button>
                    </div>

                    <div className="space-y-6">
                      {exerciseForm.questions.map((question, qIdx) => (
                        <div
                          key={question.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">
                              Question {qIdx + 1}
                            </h4>
                            <button
                              onClick={() => removeQuestion(qIdx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="space-y-3">
                            <textarea
                              rows={2}
                              value={question.texte}
                              onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>
                              ) =>
                                updateQCMQuestion(qIdx, "texte", e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                              placeholder="Saisissez votre question..."
                            />

                            <div>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={question.multiple_answers || false}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) =>
                                    updateQCMQuestion(
                                      qIdx,
                                      "multiple_answers",
                                      e.target.checked
                                    )
                                  }
                                  className="rounded"
                                />
                                Plusieurs réponses correctes autorisées
                              </label>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  Options de réponse
                                </span>
                                <button
                                  onClick={() => addQCMOption(qIdx)}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  + Ajouter option
                                </button>
                              </div>

                              {question.options?.map((option, oIdx) => (
                                <div
                                  key={option.id}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type={
                                      question.multiple_answers
                                        ? "checkbox"
                                        : "radio"
                                    }
                                    name={`question_${qIdx}_correct`}
                                    checked={option.is_correct}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      if (!question.multiple_answers) {
                                        // Pour radio: décocher toutes les autres options
                                        setExerciseForm((prev) => ({
                                          ...prev,
                                          questions: prev.questions.map(
                                            (q, qIndex) => {
                                              if (qIndex === qIdx) {
                                                return {
                                                  ...q,
                                                  options: q.options?.map(
                                                    (opt, optIndex) => ({
                                                      ...opt,
                                                      is_correct:
                                                        optIndex === oIdx
                                                          ? e.target.checked
                                                          : false,
                                                    })
                                                  ),
                                                };
                                              }
                                              return q;
                                            }
                                          ),
                                        }));
                                      } else {
                                        updateQCMOption(
                                          qIdx,
                                          oIdx,
                                          "is_correct",
                                          e.target.checked
                                        );
                                      }
                                    }}
                                    className="rounded"
                                  />
                                  <input
                                    type="text"
                                    value={option.texte}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                      updateQCMOption(
                                        qIdx,
                                        oIdx,
                                        "texte",
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={`Option ${oIdx + 1}`}
                                  />
                                  {question.options &&
                                    question.options.length > 2 && (
                                      <button
                                        onClick={() => {
                                          setExerciseForm((prev) => ({
                                            ...prev,
                                            questions: prev.questions.map(
                                              (q, qIndex) => {
                                                if (
                                                  qIndex === qIdx &&
                                                  q.options
                                                ) {
                                                  return {
                                                    ...q,
                                                    options: q.options.filter(
                                                      (_, optIndex) =>
                                                        optIndex !== oIdx
                                                    ),
                                                  };
                                                }
                                                return q;
                                              }
                                            ),
                                          }));
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X size={16} />
                                      </button>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {exerciseType === "qro" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Questions ouvertes
                      </h3>
                      <button
                        onClick={addQROQuestion}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Ajouter une question
                      </button>
                    </div>

                    <div className="space-y-4">
                      {exerciseForm.questions.map((question, qIdx) => (
                        <div
                          key={question.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-gray-900">
                              Question {qIdx + 1}
                            </h4>
                            <button
                              onClick={() => removeQuestion(qIdx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <textarea
                            rows={3}
                            value={question.texte}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>
                            ) => updateQROQuestion(qIdx, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                            placeholder="Saisissez votre question ouverte..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {exerciseType && (
            <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setExerciseType(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Retour au choix
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowExerciseForm(false);
                    setExerciseType(null);
                    setSelectedSectionForExercise(null);
                  }}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateExercise}
                  disabled={uploading || !exerciseForm.nom.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Créer l'exercice
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fonction pour ouvrir le modal d'édition
  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setEditSectionForm({
      nom: section.nom,
      description: section.description || "",
      ordre: section.ordre,
      cours_id: section.cours_id,
      pdf_file: null, // Nouveau fichier optionnel
      video_file: null, // Nouveau fichier optionnel
    });
    setShowEditSectionForm(true);
  };

  const renderSectionsContent = () => (
    <div className="space-y-6">
      {/* Header avec sélection de cours */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sections de cours
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez le contenu pédagogique de vos cours
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sélecteur de cours */}
          <select
            value={selectedCourse?.id || ""}
            onChange={(e) => {
              const course = courses.find((c) => c.id === e.target.value);
              setSelectedCourse(course || null);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-48"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.nom}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowSectionForm(true)}
            disabled={!selectedCourse}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Nouvelle section
          </button>
        </div>
      </div>

      {!selectedCourse ? (
        /* État de sélection de cours */
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sélectionnez un cours
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Choisissez un cours dans la liste ci-dessus pour voir ses sections
            ou en créer de nouvelles.
          </p>
        </div>
      ) : sections.length === 0 ? (
        /* État vide pour le cours sélectionné */
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucune section pour ce cours
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Créez la première section de "{selectedCourse.nom}" avec du contenu
            PDF ou vidéo.
          </p>
          <button
            onClick={() => setShowSectionForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Créer une section
          </button>
        </div>
      ) : (
        /* Liste des sections */
        <div className="space-y-4">
          {/* Info du cours sélectionné */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  {selectedCourse.nom}
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  {sections.length} section(s) • {selectedCourse.duration}h de
                  formation
                </p>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                Cours actif
              </span>
            </div>
          </div>

          {/* Actions globales */}
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setCollapsedSections(new Set())}
              className="text-blue-600 hover:text-blue-700"
            >
              Tout déplier
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() =>
                setCollapsedSections(new Set(sections.map((s) => s.id)))
              }
              className="text-blue-600 hover:text-blue-700"
            >
              Tout replier
            </button>
          </div>
          {/* Stats en bas */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                {sections.length}
                              </div>
                              <div className="text-xs text-gray-600">
                                Sections
                              </div>
                            </div>
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                {sections.filter((s) => s.has_pdf).length}
                              </div>
                              <div className="text-xs text-gray-600">
                                Documents
                              </div>
                            </div>
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                {sections.filter((s) => s.has_video).length}
                              </div>
                              <div className="text-xs text-gray-600">
                                Vidéos
                              </div>
                            </div>
                            <div>
                              <div className="text-xl font-bold text-gray-900">
                                {exercises.length}
                              </div>
                              <div className="text-xs text-gray-600">
                                Exercices
                              </div>
                            </div>
                          </div>
                        </div>
          {/* Grille des sections pliables */}
          <div className="grid gap-3">
            {sections.map((section, index) => {
              const isCollapsed = isSectionCollapsed(section.id);

              return (
                <div
                  key={section.id}
                  className="bg-white border border-gray-200 rounded-md hover:border-blue-200 transition-all duration-200"
                >
                  {/* Header de la section - Toujours visible */}
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Bouton collapse/expand */}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          {isCollapsed ? (
                            <ChevronRight size={20} />
                          ) : (
                            <ChevronDown size={20} />
                          )}
                        </button>

                        {/* Numéro d'ordre */}
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-blue-600">
                            {section.ordre}
                          </span>
                        </div>

                        {/* Titre et badges de contenu */}
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {section.nom}
                          </h4>

                          {/* Badges de contenu disponible */}
                          <div className="flex gap-1">
                            {section.has_video && (
                              <span
                                className="w-2 h-2 bg-purple-400 rounded-full"
                                title="Contient une vidéo"
                              />
                            )}
                            {section.has_pdf && (
                              <span
                                className="w-2 h-2 bg-gray-400 rounded-full"
                                title="Contient un document"
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions rapides - toujours visibles */}
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleAddExercice(section)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                          title="Ajouter un exercice"
                        >
                          <Plus size={14} />
                          Ajouter un Exercice
                        </button>

                        <button
                          onClick={() => handleEditSection(section)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Modifier la section"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Supprimer la section"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Contenu détaillé - Masquable */}
                  {!isCollapsed && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="ml-11 space-y-4">
                        {/* Description complète */}
                        {section.description && (
                          <p className="text-gray-600 text-sm leading-relaxed pt-4">
                            {section.description}
                          </p>
                        )}

                        {/* Contenu vidéo avec prévisualisation */}
                        {section.has_video && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <PlayCircle
                                size={16}
                                className="text-purple-600"
                              />
                              Vidéo: {getVideoFileName(section)}
                            </h5>
                            <div className="relative bg-gray-900 rounded-md overflow-hidden">
                              <video
                                controls
                                controlsList="nodownload"
                                preload="metadata"
                                className="w-full h-full object-cover"
                              >
                                <source
                                  src={getVideoUrl(section) ?? "undefined.mp4"}
                                  type="video/mp4"
                                />
                                Votre navigateur ne supporte pas la lecture
                                vidéo.
                              </video>
                            </div>
                          </div>
                        )}

                        {/* Section Ressources pour les documents */}
                        {section.has_pdf && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <FileText size={16} className="text-gray-600" />
                              Ressources
                            </h5>
                            <div className="border border-gray-200 rounded-md p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-50 rounded-md flex items-center justify-center">
                                    <FileText
                                      size={16}
                                      className="text-orange-500"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                      {getPdfFileName(section)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Document PDF
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const pdfUrl = getPdfUrl(section);
                                    if (pdfUrl) {
                                      handleDownloadFile(
                                        pdfUrl,
                                        getPdfFileName(section) ??
                                          "undefined.pdf"
                                      );
                                    }
                                  }}
                                  className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md text-sm transition-colors flex items-center gap-1"
                                >
                                  <Download size={14} />
                                  Télécharger
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* État si aucun contenu */}
                        {!section.has_pdf && !section.has_video && (
                          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-md">
                            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">
                              Aucun contenu ajouté
                            </p>
                            <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                              Ajouter du contenu
                            </button>
                          </div>
                        )}

                        {(() => {
                          const sectionExercises = getExercisesForSection(
                            section.id
                          );
                          return sectionExercises.length > 0 ? (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                <PenTool size={16} className="text-green-600" />
                                Exercices ({sectionExercises.length})
                              </h5>
                              <div className="space-y-3">
                                {sectionExercises.map((exercise) => (
                                  <div
                                    key={exercise.id}
                                    className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        {/* Icône selon le type d'exercice */}
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                                          {exercise.type === "pdf" && (
                                            <div className="bg-red-100 w-8 h-8 rounded-lg flex items-center justify-center">
                                              <FileText
                                                size={16}
                                                className="text-red-500"
                                              />
                                            </div>
                                          )}
                                          {exercise.type === "qcm" && (
                                            <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center">
                                              <CheckCircle
                                                size={16}
                                                className="text-blue-500"
                                              />
                                            </div>
                                          )}
                                          {exercise.type === "qro" && (
                                            <div className="bg-green-100 w-8 h-8 rounded-lg flex items-center justify-center">
                                              <Edit3
                                                size={16}
                                                className="text-green-500"
                                              />
                                            </div>
                                          )}
                                        </div>

                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 text-sm">
                                              {exercise.nom}
                                            </p>

                                            {/* Badge du type */}
                                            <span
                                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                exercise.type === "pdf"
                                                  ? "bg-red-100 text-red-700"
                                                  : exercise.type === "qcm"
                                                  ? "bg-blue-100 text-blue-700"
                                                  : "bg-green-100 text-green-700"
                                              }`}
                                            >
                                              {exercise.type.toUpperCase()}
                                            </span>
                                          </div>

                                          {/* Informations supplémentaires */}
                                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            {exercise.type !== "pdf" && (
                                              <>
                                                {exercise.duree_minutes && (
                                                  <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {exercise.duree_minutes} min
                                                  </span>
                                                )}
                                                {exercise.note_sur && (
                                                  <span>
                                                    Note sur {exercise.note_sur}
                                                  </span>
                                                )}
                                                {(exercise.type === "qcm" ||
                                                  exercise.type === "qro") && (
                                                  <span>
                                                    {exercise.questions_count ||
                                                      0}{" "}
                                                    question(s)
                                                  </span>
                                                )}
                                              </>
                                            )}
                                          </div>

                                          {/* Description si présente */}
                                          {exercise.description && (
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                              {exercise.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-1">
                                      {/* Bouton principal selon le type */}
                                      {exercise.type === "pdf" ? (
                                        <button
                                          onClick={() => handleDownloadExercise(exercise)}
                                          className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs transition-colors flex items-center gap-1"
                                          title="Télécharger l'exercice PDF"
                                        >
                                          <Download size={12} />
                                          PDF
                                        </button>
                                      ) : null}

                                        {/* Menu actions */}
                                        <button
                                          onClick={() => {
                                            // TODO: Fonction d'édition d'exercice
                                            console.log(
                                              "Modifier exercice:",
                                              exercise.id
                                            );
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                          title="Modifier l'exercice"
                                        >
                                          <Pencil size={12} />
                                        </button>

                                        <button
                                          onClick={() =>
                                            handleDeleteExercise(exercise.id)
                                          }
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          title="Supprimer l'exercice"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null;
                        })()}


                        {/* Actions supplémentaires */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <div className="flex gap-2">
                            {!section.has_video && (
                              <button
                                onClick={() => handleEditSection(section)}
                                className="px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-md text-sm transition-colors flex items-center gap-1"
                              >
                                <PlayCircle size={14} />
                                Ajouter une vidéo
                              </button>
                            )}
                            {!section.has_pdf && (
                              <button className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md text-sm transition-colors flex items-center gap-1">
                                <FileText size={14} />
                                Ajouter document
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {loadingSections && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Chargement des sections...</p>
        </div>
      )}
    </div>
  );

  // Fonction pour mettre à jour la section
  const handleUpdateSection = async () => {
    const { nom, description, ordre, cours_id, pdf_file, video_file } =
      editSectionForm;

    if (!nom.trim()) {
      alert("Le nom de la section est obligatoire");
      return;
    }

    if (!editingSection?.id || !user?.id) {
      alert("Erreur lors de la modification");
      return;
    }

    try {
      setUploadingSection(true);

      let updatedData = {
        nom: nom.trim(),
        description: description?.trim() || null,
        ordre: ordre,
        cours_id: cours_id,
        pdf_url: "",
        has_pdf: editingSection.has_pdf,
        video_url: "",
        has_video: editingSection.has_video,
      };

      // Si un nouveau PDF est uploadé
      if (pdf_file) {
        const pdfResult = await uploadFile(pdf_file, "section_pdfs", "pdfs/");
        if (pdfResult) {
          // Supprimer l'ancien PDF si il existe
          if (editingSection.pdf_url) {
            await supabase.storage
              .from("section_pdfs")
              .remove([editingSection.pdf_url]);
          }
          updatedData.pdf_url = pdfResult.fileName ?? "undefined.pdf";
          updatedData.has_pdf = true;
        }
      }

      // Si une nouvelle vidéo est uploadée
      if (video_file) {
        const videoResult = await uploadFile(
          video_file,
          "section_videos",
          "videos/"
        );
        if (videoResult) {
          // Supprimer l'ancienne vidéo si elle existe
          if (editingSection.video_url) {
            await supabase.storage
              .from("section_videos")
              .remove([editingSection.video_url]);
          }
          updatedData.video_url = videoResult.fileName ?? "undefined.mp4";
          updatedData.has_video = true;
        }
      }

      // Mettre à jour la section dans la base de données
      const { error } = await supabase
        .from("sections")
        .update(updatedData)
        .eq("id", editingSection.id)
        .eq("created_by", user.id);

      if (error) throw error;

      // Recharger les sections
      if (selectedCourse?.id) {
        await loadSectionsForCourse(selectedCourse.id);
      }

      // Fermer le modal
      setShowEditSectionForm(false);
      setEditingSection(null);
      setEditSectionForm({
        nom: "",
        description: "",
        ordre: 1,
        cours_id: "",
        pdf_file: null,
        video_file: null,
      });

      console.log("✅ Section modifiée avec succès");
    } catch (error) {
      console.error("Erreur modification section:", error);
      alert("Erreur lors de la modification de la section");
    } finally {
      setUploadingSection(false);
    }
  };

  const loadSectionsForCourse = async (coursId: string) => {
    try {
      setLoadingSections(true);
      console.log("Chargement sections pour le cours:", coursId);

      const { data, error } = await supabase
        .from("sections")
        .select("*")
        .eq("cours_id", coursId)
        .order("ordre", { ascending: true });

      if (error) {
        console.error("Erreur chargement sections:", error);
        throw error;
      }

      console.log("Sections récupérées:", data);
      setSections(data || []);
    } catch (error) {
      console.error("Erreur chargement sections:", error);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const renderContent = () => {
    // Vue d'ensemble du dashboard
    // Vue d'ensemble par défaut
    if (activeMainTab === "dashboard") {
      return renderDashboardOverview();
    }
    //
    if (
      activeMainTab === "cours-modules" &&
      activeTab === "mes-modules" &&
      modules.length > 0
    ) {
      return renderModulesContent();
    }
    // Pour les filières
    if (
      activeMainTab === "cours-modules" &&
      activeTab === "filieres" &&
      filieres.length > 0
    ) {
      return renderFilieresContent();
    }
    // Pour les filières
    if (
      activeMainTab === "cours-modules" &&
      activeTab === "mes-cours" &&
      courses.length > 0
    ) {
      return renderCoursesContent();
    }

    // Pour les filières
    if (
      activeMainTab === "cours-modules" &&
      activeTab === "mes-sections" &&
      sections.length > 0
    ) {
      return renderSectionsContent();
    }

    // États vides améliorés
    const currentState = getCurrentEmptyState();
    const Icon = currentState.icon;

    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 mb-3">
          {currentState.title}
        </h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          {currentState.description}
        </p>
        <button
          onClick={() => {
            if (activeTab === "mes-modules") setShowModuleForm(true);
            if (activeTab === "filieres") setShowFiliereForm(true);
            if (activeTab === "mes-cours") setShowCourseForm(true);
            if (activeTab === "mes-sections") setShowSectionForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-flex items-center gap-2"
        >
          <Plus size={18} />
          {currentState.cta}
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Sidebar redesignée */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 font-bold text-white text-md rounded-md flex items-center justify-center">
              E
            </div>
            <span className="ml-3 font-bold text-slate-900 text-lg">
              EduPlatform
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {mainTabs.map((tab) => (
            <div key={tab.id} className="mb-1">
              <button
                onClick={() => {
                  setActiveMainTab(tab.id);
                  if (tab.subTabs) {
                    setActiveTab(tab.subTabs[0].id);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`w-full flex items-center px-3 py-2 rounded-md transition-colors ${
                  activeMainTab === tab.id
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <tab.icon size={20} className="mr-3" />
                <span className="font-medium">{tab.name}</span>
              </button>

              {tab.subTabs && activeMainTab === tab.id && (
                <div className="ml-6 mt-2 space-y-1">
                  {tab.subTabs.map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setActiveTab(subTab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        activeTab === subTab.id
                          ? "bg-blue-100 text-blue-600"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <subTab.icon size={16} className="mr-2" />
                      {subTab.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header redesigné */}
        <header className="bg-white border-b border-slate-200 h-16 fixed top-0 right-0 left-0 lg:left-64 z-30">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-700 mr-4"
              >
                <Menu size={20} />
              </button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center text-sm text-slate-500">
                <span className="font-medium text-slate-900">
                  {mainTabs.find((t) => t.id === activeMainTab)?.name}
                </span>
                {activeMainTab === "cours-modules" && (
                  <>
                    <ChevronRight size={16} className="mx-2" />
                    <span>
                      {
                        mainTabs
                          .find((t) => t.id === activeMainTab)
                          ?.subTabs?.find((s) => s.id === activeTab)?.name
                      }
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 w-64 bg-slate-50 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
              </div>

              {/* Calendrier */}
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-md transition-colors"
                title="Organiser une visioconférence"
              >
                <Video size={18} />
              </button>

              {/* Calendrier */}
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-md transition-colors"
                title="Programmer un évènement"
              >
                <Calendar size={18} />
              </button>

              {/* Profile */}
              <div className="flex items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-slate-900">
                      {user.nomEcole}
                    </div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-4 text-slate-500 hover:text-slate-700 p-2 hover:bg-slate-100 rounded-md transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 mt-16 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
      {/* Modal formulaire (conservé mais avec nouveau style) */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Créer un nouveau module
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Regroupez vos cours par thématique
                </p>
              </div>
              <button
                onClick={() => setShowModuleForm(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ajouter une image de couverture max 2MB (optionnel)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setModuleForm({ ...moduleForm, image_url: file });
                    }
                  }}
                  className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Développement Web Moderne, Gestion de Projet..."
                />
              </div>
              {moduleForm.image_url && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">Image actuelle :</p>
                  <img
                    src={
                      moduleForm.image_url
                        ? URL.createObjectURL(moduleForm.image_url)
                        : ""
                    }
                    alt="Aperçu actuel"
                    className="w-92 h-92 object-cover rounded border"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 my-2">
                  Nom du module
                </label>
                <input
                  type="text"
                  value={moduleForm.nom}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, nom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Développement Web Moderne, Gestion de Projet..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical transition-colors"
                  placeholder="Décrivez les objectifs et le contenu de ce module..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Auteur
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    value={moduleForm.author}
                    onChange={(e) =>
                      setModuleForm({
                        ...moduleForm,
                        author: e.target.value,
                      })
                    }
                    placeholder="M. BANAKEN Ariel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Durée (heures)
                  </label>
                  <input
                    type="number"
                    value={moduleForm.duration}
                    onChange={(e) =>
                      setModuleForm({
                        ...moduleForm,
                        duration: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filières concernées
                </label>
                <div className="border border-slate-300 rounded-md p-3 max-h-32 overflow-y-auto bg-slate-50">
                  <div className="space-y-2">
                    {filieres.map((filiere) => (
                      <label
                        key={filiere.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={moduleForm.filières.includes(filiere.nom)}
                          onChange={() => handleFilièreToggle(filiere.nom)}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-slate-700">
                          {filiere.nom}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200">
              <button
                onClick={() => setShowModuleForm(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium"
                onClick={() => handleCreateModuleDB()}
              >
                Créer le module
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal d'édition de module */}
      {showEditModuleForm && editingModule && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 m-0">
                  Modifier le module
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Modifiez les informations du module
                </p>
              </div>
              <button
                onClick={() => setShowEditModuleForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ajouter une image de couverture max 2MB (optionnel)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file); // Stocker dans l'état séparé
                    }
                  }}
                  className="w-full px-3 py-2 mb-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Ex: Développement Web Moderne, Gestion de Projet..."
                />

                {/* Affichage de l'image actuelle si elle existe */}
                {editModuleForm.image_url && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600 mb-1">
                      Image actuelle :
                    </p>
                    <img
                      src={editModuleForm.image_url}
                      alt="Aperçu actuel"
                      className="w-92 h-92 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du module *
                </label>
                <input
                  type="text"
                  value={editModuleForm.nom}
                  onChange={(e) =>
                    setEditModuleForm({
                      ...editModuleForm,
                      nom: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Développement Web Avancé, Gestion de Projet..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du module *
                </label>
                <textarea
                  value={editModuleForm.description}
                  onChange={(e) =>
                    setEditModuleForm({
                      ...editModuleForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                  placeholder="Décrivez le module..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'auteur *
                </label>
                <input
                  type="text"
                  value={editModuleForm.author}
                  onChange={(e) =>
                    setEditModuleForm({
                      ...editModuleForm,
                      author: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: OUM Simon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée du module
                </label>
                <input
                  type="text"
                  value={editModuleForm.duration}
                  onChange={(e) =>
                    setEditModuleForm({
                      ...editModuleForm,
                      duration: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="l'unité de la durée du module est l'heure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filières concernées
                </label>
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filieres.map((filiere) => (
                      <label
                        key={filiere.id}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={editModuleForm.filieres.includes(
                            filiere.nom
                          )}
                          onChange={() => {
                            setEditModuleForm((prev) => ({
                              ...prev,
                              filieres: prev.filieres.includes(filiere.nom)
                                ? prev.filieres.filter((f) => f !== filiere.nom)
                                : [...prev.filieres, filiere.nom],
                            }));
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {filiere.nom}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowEditModuleForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (
                      !editModuleForm.nom.trim() ||
                      !editModuleForm.description.trim() ||
                      !editModuleForm.author.trim() ||
                      !editModuleForm.duration
                    ) {
                      alert("Veuillez remplir tous les champs");
                      return;
                    }
                    // Récupérer les IDs des filières sélectionnées
                    const selectedFilieres = filieres.filter((f) =>
                      editModuleForm.filieres.includes(f.nom)
                    );
                    try {
                      // Update module
                      const { error } = await supabase
                        .from("modules")
                        .update({
                          image: moduleForm.image_url,
                          nom: editModuleForm.nom.trim(),
                          description: editModuleForm.description.trim(),
                          author: editModuleForm.author.trim(),
                          duration: editModuleForm.duration,
                        })
                        .eq("id", editingModule.id)
                        .eq("firebase_uid", user?.id);
                      if (error) throw error;
                      // Update module_filieres (delete all then insert new)
                      await supabase
                        .from("module_filieres")
                        .delete()
                        .eq("module_id", editingModule.id);
                      if (selectedFilieres.length > 0) {
                        await supabase.from("module_filieres").insert(
                          selectedFilieres.map((f) => ({
                            module_id: editingModule.id,
                            filiere_id: f.id,
                          }))
                        );
                      }
                      await loadModulesForUser(user.id);
                      setShowEditModuleForm(false);
                      setEditingModule(null);
                    } catch (err) {
                      alert("Erreur lors de la modification du module");
                      console.error(err);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  type="button"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 🎯 MODAL DÉPLACÉ ICI - Toujours disponible */}
      {showFiliereForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 m-0">
                  Créer une nouvelle filière
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ajoutez une spécialité d'enseignement
                </p>
              </div>
              <button
                onClick={() => {
                  setShowFiliereForm(false);
                  setFiliereForm({ nom: "", description: "" });
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la filière *
                </label>
                <input
                  type="text"
                  value={filiereForm.nom}
                  onChange={(e) =>
                    setFiliereForm({ ...filiereForm, nom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Informatique, Génie Civil, Commerce..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={filiereForm.description}
                  onChange={(e) =>
                    setFiliereForm({
                      ...filiereForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                  placeholder="Description de la filière..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowFiliereForm(false);
                    setFiliereForm({ nom: "", description: "" });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateFiliere}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer"
                  type="button"
                >
                  Créer la filière
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de modification des filières */}
      {showEditFiliereForm && editingFiliere && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 m-0">
                  Modifier la filière
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Modifiez les informations de la filière
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditFiliereForm(false);
                  setEditingFiliere(null);
                  setEditFiliereForm({ nom: "", description: "" });
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la filière *
                </label>
                <input
                  type="text"
                  value={editFiliereForm.nom}
                  onChange={(e) =>
                    setEditFiliereForm({
                      ...editFiliereForm,
                      nom: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Informatique, Génie Civil, Commerce..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnelle)
                </label>
                <textarea
                  value={editFiliereForm.description}
                  onChange={(e) =>
                    setEditFiliereForm({
                      ...editFiliereForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 text-gray-700 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                  placeholder="Description de la filière..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditFiliereForm(false);
                    setEditingFiliere(null);
                    setEditFiliereForm({ nom: "", description: "" });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateFiliere}
                  className="flex-1 px-4 py-2 bg-green-50 hover:bg-green-600 hover:text-white text-green-600 rounded-md transition-colors cursor-pointer"
                  type="button"
                >
                  Mettre à jour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCourseForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 m-0">
                  Créer un nouveau cours
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ajoutez un cours à un module existant
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCourseForm(false);
                  setCourseForm({
                    nom: "",
                    description: "",
                    author: "",
                    duration: 0,
                    module_id: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner un module *
                </label>
                <select
                  value={courseForm.module_id}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, module_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Choisir un module...</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du cours *
                </label>
                <input
                  type="text"
                  value={courseForm.nom}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, nom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Introduction à React, Bases de données relationnelles..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du cours *
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                  placeholder="Décrivez les objectifs et le contenu de ce cours..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auteur du cours *
                </label>
                <input
                  type="text"
                  value={courseForm.author}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, author: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: M. BANAKEN Ariel, Pr. NGUIMFACK Thierry..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée du cours (en heures) *
                </label>
                <input
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      duration: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: 2"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCourseForm(false);
                    setCourseForm({
                      nom: "",
                      description: "",
                      author: "",
                      duration: 0,
                      module_id: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  type="button"
                >
                  Créer le cours
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal d'édition de cours */}
      {showEditCourseForm && editingCourse && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 m-0">
                  Modifier le cours
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Modifiez les informations du cours
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditCourseForm(false);
                  setEditingCourse(null);
                  setEditCourseForm({
                    nom: "",
                    description: "",
                    author: "",
                    duration: 0,
                    module_id: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module associé *
                </label>
                <select
                  value={editCourseForm.module_id}
                  onChange={(e) =>
                    setEditCourseForm({
                      ...editCourseForm,
                      module_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Choisir un module...</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du cours *
                </label>
                <input
                  type="text"
                  value={editCourseForm.nom}
                  onChange={(e) =>
                    setEditCourseForm({
                      ...editCourseForm,
                      nom: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Introduction à React, Bases de données relationnelles..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du cours *
                </label>
                <textarea
                  value={editCourseForm.description}
                  onChange={(e) =>
                    setEditCourseForm({
                      ...editCourseForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                  placeholder="Décrivez les objectifs et le contenu de ce cours..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auteur du cours *
                </label>
                <input
                  type="text"
                  value={editCourseForm.author}
                  onChange={(e) =>
                    setEditCourseForm({
                      ...editCourseForm,
                      author: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: M. Dupont, Dr. Martin..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée du cours (en heures) *
                </label>
                <input
                  type="number"
                  value={editCourseForm.duration}
                  onChange={(e) =>
                    setEditCourseForm({
                      ...editCourseForm,
                      duration: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: 2"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditCourseForm(false);
                    setEditingCourse(null);
                    setEditCourseForm({
                      nom: "",
                      description: "",
                      author: "",
                      duration: 0,
                      module_id: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateCourse}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  type="button"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Calendrier Desktop - Position absolue avec background flou */}
      {showCalendar && (
        <div className="hidden lg:block fixed top-16 right-0 w-80 xl:w-96 h-full z-40">
          <div className="h-full bg-gray-50/80 backdrop-blur-md border-l border-gray-200">
            <div className="h-full overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Calendrier de Programmation
                </h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              </div>
              {renderCalendar()}

              {/* Légende */}
              <div className="mt-4 bg-white/90 backdrop-blur-sm rounded-md border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Types de contenu
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Cours</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Chapitre</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-600">Exercice</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Calendrier Mobile */}
      {showCalendar && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Calendrier de programmation
              </h2>
              <button
                onClick={() => setShowCalendar(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">{renderCalendar()}</div>
          </div>
        </div>
      )}
      {/* Modal de création de section*/}
      {showSectionForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Créer une nouvelle section
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Ajoutez du contenu pédagogique à votre cours
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSectionForm(false);
                  setSectionForm({
                    nom: "",
                    description: "",
                    ordre: 1,
                    cours_id: "",
                    pdf_file: null,
                    video_file: null,
                  });
                }}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la section *
                  </label>
                  <input
                    type="text"
                    value={sectionForm.nom}
                    onChange={(e) =>
                      setSectionForm({ ...sectionForm, nom: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Introduction, Chapitre 1, Exercices pratiques..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sectionForm.ordre}
                    onChange={(e) =>
                      setSectionForm({
                        ...sectionForm,
                        ordre: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Sélection du cours parent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cours parent *
                </label>
                <select
                  value={sectionForm.cours_id}
                  onChange={(e) =>
                    setSectionForm({ ...sectionForm, cours_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Sélectionnez un cours</option>
                  {courses.map((cours) => (
                    <option key={cours.id} value={cours.id}>
                      {cours.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={sectionForm.description}
                  onChange={(e) =>
                    setSectionForm({
                      ...sectionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors"
                  placeholder="Décrivez le contenu de cette section..."
                />
              </div>

              {/* Section des fichiers */}
              <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Contenus pédagogiques
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload PDF */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-red-500" />
                      <label className="text-sm font-medium text-gray-700">
                        Document PDF (optionnel)
                      </label>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === "application/pdf") {
                            setSectionForm({ ...sectionForm, pdf_file: file });
                          } else if (file) {
                            alert(
                              "Veuillez sélectionner un fichier PDF valide"
                            );
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />

                      {sectionForm.pdf_file && (
                        <div className="mt-2 p-2 bg-red-50 rounded-md flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-red-500" />
                            <span className="text-sm text-gray-700">
                              {sectionForm.pdf_file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              (
                              {(
                                sectionForm.pdf_file.size /
                                (1024 * 1024)
                              ).toFixed(1)}{" "}
                              MB)
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setSectionForm({ ...sectionForm, pdf_file: null })
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      📄 Le PDF sera téléchargeable par les étudiants
                    </p>
                  </div>

                  {/* Upload Vidéo */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <PlayCircle size={16} className="text-blue-500" />
                      <label className="text-sm font-medium text-gray-700">
                        Vidéo (optionnel)
                      </label>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type.startsWith("video/")) {
                            // Vérifier la taille (limite à 100MB par exemple)
                            if (file.size > 100 * 1024 * 1024) {
                              alert(
                                "Le fichier vidéo est trop volumineux (max 100MB)"
                              );
                              return;
                            }
                            setSectionForm({
                              ...sectionForm,
                              video_file: file,
                            });
                          } else if (file) {
                            alert(
                              "Veuillez sélectionner un fichier vidéo valide"
                            );
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />

                      {sectionForm.video_file && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-md flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PlayCircle size={16} className="text-blue-500" />
                            <span className="text-sm text-gray-700">
                              {sectionForm.video_file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              (
                              {(
                                sectionForm.video_file.size /
                                (1024 * 1024)
                              ).toFixed(1)}{" "}
                              MB)
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setSectionForm({
                                ...sectionForm,
                                video_file: null,
                              })
                            }
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      🎥 La vidéo sera visible en streaming uniquement
                    </p>
                  </div>
                </div>

                {/* Résumé des fichiers */}
                {(sectionForm.pdf_file || sectionForm.video_file) && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      Fichiers sélectionnés :
                    </p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {sectionForm.pdf_file && (
                        <li>
                          • Document PDF : {sectionForm.pdf_file.name}{" "}
                          (téléchargeable)
                        </li>
                      )}
                      {sectionForm.video_file && (
                        <li>
                          • Vidéo : {sectionForm.video_file.name} (streaming
                          uniquement)
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowSectionForm(false);
                  setSectionForm({
                    nom: "",
                    description: "",
                    ordre: 1,
                    cours_id: "",
                    pdf_file: null,
                    video_file: null,
                  });
                }}
                disabled={uploadingSection}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateSection}
                disabled={
                  uploadingSection ||
                  !sectionForm.nom.trim() ||
                  !sectionForm.cours_id
                }
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors font-medium flex items-center gap-2"
              >
                {uploadingSection ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Créer la section
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditSectionForm && editingSection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Modifier la section
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Modifiez les informations de la section "{editingSection.nom}"
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditSectionForm(false);
                  setEditingSection(null);
                  setEditSectionForm({
                    nom: "",
                    description: "",
                    ordre: 1,
                    cours_id: "",
                    pdf_file: null,
                    video_file: null,
                  });
                }}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de la section *
                  </label>
                  <input
                    type="text"
                    value={editSectionForm.nom}
                    onChange={(e) =>
                      setEditSectionForm({
                        ...editSectionForm,
                        nom: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ex: Introduction, Chapitre 1..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editSectionForm.ordre}
                    onChange={(e) =>
                      setEditSectionForm({
                        ...editSectionForm,
                        ordre: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editSectionForm.description}
                  onChange={(e) =>
                    setEditSectionForm({
                      ...editSectionForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors"
                  placeholder="Décrivez le contenu de cette section..."
                />
              </div>

              {/* Fichiers actuels */}
              {(editingSection.has_pdf || editingSection.has_video) && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Contenus actuels
                  </h3>
                  <div className="space-y-2">
                    {editingSection.has_pdf && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={16} className="text-orange-500" />
                        <span>Document PDF actuel</span>
                      </div>
                    )}
                    {editingSection.has_video && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PlayCircle size={16} className="text-purple-500" />
                        <span>Vidéo actuelle</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nouveaux fichiers */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Remplacer le contenu (optionnel)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nouveau PDF */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText size={16} className="text-red-500" />
                      Nouveau document PDF
                    </label>

                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === "application/pdf") {
                          setEditSectionForm({
                            ...editSectionForm,
                            pdf_file: null,
                          });
                        } else if (file) {
                          alert("Veuillez sélectionner un fichier PDF valide");
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />

                    {editSectionForm.pdf_file && (
                      <div className="p-2 bg-red-50 rounded-md flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {editSectionForm.pdf_file.name}
                        </span>
                        <button
                          onClick={() =>
                            setEditSectionForm({
                              ...editSectionForm,
                              pdf_file: null,
                            })
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Nouvelle vidéo */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <PlayCircle size={16} className="text-purple-500" />
                      Nouvelle vidéo
                    </label>

                    <input
                      type="file"
                      accept="video/*,.mp4,.avi,.mov,.wmv,.flv,.webm"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type.startsWith("video/")) {
                          if (file.size > 100 * 1024 * 1024) {
                            alert(
                              "Le fichier vidéo est trop volumineux (max 100MB)"
                            );
                            return;
                          }
                          setEditSectionForm({
                            ...editSectionForm,
                            video_file: file,
                          });
                        } else if (file) {
                          alert(
                            "Veuillez sélectionner un fichier vidéo valide"
                          );
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />

                    {editSectionForm.video_file && (
                      <div className="p-2 bg-purple-50 rounded-md flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {editSectionForm.video_file.name}
                        </span>
                        <button
                          onClick={() =>
                            setEditSectionForm({
                              ...editSectionForm,
                              video_file: null,
                            })
                          }
                          className="text-purple-500 hover:text-purple-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowEditSectionForm(false);
                  setEditingSection(null);
                }}
                disabled={uploadingSection}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateSection}
                disabled={uploadingSection || !editSectionForm.nom.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                {uploadingSection ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <Pencil size={16} />
                    Modifier la section
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showExerciseForm && selectedSectionForExercise && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {!exerciseType
                    ? "Créer un exercice"
                    : `Créer un exercice ${exerciseType.toUpperCase()}`}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Section: {selectedSectionForExercise.nom}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowExerciseForm(false);
                  setExerciseType(null);
                  setSelectedSectionForExercise(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {!exerciseType ? (
                /* Sélection du type d'exercice */
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Quel type d'exercice souhaitez-vous créer ?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Choisissez le format qui convient le mieux à votre contenu
                      pédagogique.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option PDF */}
                    <button
                      onClick={() => selectExerciseType("pdf")}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-200 transition-colors">
                        <FileText size={24} className="text-red-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Exercice PDF
                      </h4>
                      <p className="text-sm text-gray-600">
                        Uploadez un document PDF contenant vos exercices,
                        devoirs ou cas pratiques.
                      </p>
                    </button>

                    {/* Option QCM */}
                    <button
                      onClick={() => selectExerciseType("qcm")}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <CheckCircle size={24} className="text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        QCM Interactif
                      </h4>
                      <p className="text-sm text-gray-600">
                        Créez des questions à choix multiples avec réponses
                        correctes prédéfinies.
                      </p>
                    </button>

                    {/* Option QRO */}
                    <button
                      onClick={() => selectExerciseType("qro")}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                        <Edit3 size={24} className="text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Questions Ouvertes
                      </h4>
                      <p className="text-sm text-gray-600">
                        Posez des questions ouvertes nécessitant des réponses
                        rédigées par les étudiants.
                      </p>
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulaire selon le type choisi */
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'exercice *
                      </label>
                      <input
                        type="text"
                        value={exerciseForm.nom}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            nom: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Exercices chapitre 1, Quiz de révision..."
                      />
                    </div>

                    {exerciseType !== "pdf" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Durée (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={exerciseForm.duree_minutes}
                          onChange={(e) =>
                            setExerciseForm({
                              ...exerciseForm,
                              duree_minutes: parseInt(e.target.value) || 30,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (optionnelle)
                    </label>
                    <textarea
                      rows={3}
                      value={exerciseForm.description}
                      onChange={(e) =>
                        setExerciseForm({
                          ...exerciseForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      placeholder="Instructions ou contexte pour les étudiants..."
                    />
                  </div>

                  {exerciseType !== "pdf" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note sur
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={exerciseForm.note_sur}
                        onChange={(e) =>
                          setExerciseForm({
                            ...exerciseForm,
                            note_sur: parseInt(e.target.value) || 20,
                          })
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  {/* Contenu spécifique selon le type */}
                  {exerciseType === "pdf" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fichier PDF de l'exercice *
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === "application/pdf") {
                            setExerciseForm({
                              ...exerciseForm,
                              pdf_file: file,
                            });
                          } else if (file) {
                            alert(
                              "Veuillez sélectionner un fichier PDF valide"
                            );
                          }
                        }}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                      />
                      {exerciseForm.pdf_file && (
                        <p className="text-sm text-gray-600 mt-2">
                          Fichier sélectionné: {exerciseForm.pdf_file.name}
                        </p>
                      )}
                    </div>
                  )}

                  {exerciseType === "qcm" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Questions QCM
                        </h3>
                        <button
                          onClick={addQCMQuestion}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Ajouter une question
                        </button>
                      </div>

                      <div className="space-y-6">
                        {exerciseForm.questions.map((question, qIdx) => (
                          <div
                            key={question.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">
                                Question {qIdx + 1}
                              </h4>
                              <button
                                onClick={() => removeQuestion(qIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <textarea
                                rows={2}
                                value={question.texte}
                                onChange={(e) =>
                                  updateQCMQuestion(
                                    qIdx,
                                    "texte",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                placeholder="Saisissez votre question..."
                              />

                              <div>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={question.multiple_answers || false}
                                    onChange={(e) =>
                                      updateQCMQuestion(
                                        qIdx,
                                        "multiple_answers",
                                        e.target.checked
                                      )
                                    }
                                    className="rounded"
                                  />
                                  Plusieurs réponses correctes autorisées
                                </label>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    Options de réponse
                                  </span>
                                  <button
                                    onClick={() => addQCMOption(qIdx)}
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    + Ajouter option
                                  </button>
                                </div>

                                {question.options?.map((option, oIdx) => (
                                  <div
                                    key={option.id}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type={
                                        question.multiple_answers
                                          ? "checkbox"
                                          : "radio"
                                      }
                                      name={`question_${qIdx}_correct`}
                                      checked={option.is_correct}
                                      onChange={(e) => {
                                        if (!question.multiple_answers) {
                                          // Pour radio: décocher toutes les autres options
                                          setExerciseForm((prev) => ({
                                            ...prev,
                                            questions: prev.questions.map(
                                              (q, qIndex) => {
                                                if (qIndex === qIdx) {
                                                  return {
                                                    ...q,
                                                    options: (
                                                      q.options ?? []
                                                    ).map((opt, optIndex) => ({
                                                      ...opt,
                                                      is_correct:
                                                        optIndex === oIdx
                                                          ? e.target.checked
                                                          : false,
                                                    })),
                                                  };
                                                }
                                                return q;
                                              }
                                            ),
                                          }));
                                        } else {
                                          updateQCMOption(
                                            qIdx,
                                            oIdx,
                                            "is_correct",
                                            e.target.checked
                                          );
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <input
                                      type="text"
                                      value={option.texte}
                                      onChange={(e) =>
                                        updateQCMOption(
                                          qIdx,
                                          oIdx,
                                          "texte",
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      placeholder={`Option ${oIdx + 1}`}
                                    />
                                    {(question.options ?? []).length > 2 && (
                                      <button
                                        onClick={() => {
                                          setExerciseForm((prev) => ({
                                            ...prev,
                                            questions: prev.questions.map(
                                              (q, qIndex) => {
                                                if (qIndex === qIdx) {
                                                  return {
                                                    ...q,
                                                    ooptions: q.options
                                                      ? q.options.filter(
                                                          (_, optIndex) =>
                                                            optIndex !== oIdx
                                                        )
                                                      : [],
                                                  };
                                                }
                                                return q;
                                              }
                                            ),
                                          }));
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                      >
                                        <X size={16} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {exerciseType === "qro" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Questions ouvertes
                        </h3>
                        <button
                          onClick={addQROQuestion}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                          <Plus size={16} />
                          Ajouter une question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {exerciseForm.questions.map((question, qIdx) => (
                          <div
                            key={question.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">
                                Question {qIdx + 1}
                              </h4>
                              <button
                                onClick={() => removeQuestion(qIdx)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <textarea
                              rows={3}
                              value={question.texte}
                              onChange={(e) =>
                                updateQROQuestion(qIdx, e.target.value)
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                              placeholder="Saisissez votre question ouverte..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {exerciseType && (
              <div className="flex justify-between gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setExerciseType(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Retour au choix
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowExerciseForm(false);
                      setExerciseType(null);
                      setSelectedSectionForExercise(null);
                    }}
                    disabled={uploading}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateExercise}
                    disabled={uploading || !exerciseForm.nom.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Création en cours...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Créer l'exercice
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title="Supprimer la filière"
        message={
          <>
            Êtes-vous sûr de vouloir supprimer la filière{" "}
            <span className="font-semibold">{filiereToDelete?.nom}</span> ?
          </>
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmDeleteFiliere}
        onClose={() => {
          setConfirmOpen(false);
          setFiliereToDelete(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
