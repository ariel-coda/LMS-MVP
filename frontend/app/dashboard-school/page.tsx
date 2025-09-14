"use client";
import { supabase, type Filieres } from "@/app/lib/supabaseConfig";
import ConfirmDialog from "../components/ui/dialog";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  UserRound,
  FileSpreadsheet,
  ChevronUp,
  Upload,
  Info,
  CheckCircle,
  Edit3,
  PlayCircle,
  ChevronDown,
  PencilRuler,
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
  FolderOpen,
  TrendingUp,
  Target,
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

interface Student {
  id: string;
  nom: string;
  prenom: string;
  matricule: string;
  filieres: string;
  nomComplet: string;
  email: string;
  telephone: string;
  sexe: string;
  dateNaissance: string;
  cni: File | null;
  diplome: File | null;
  photo?: File | null; // Champ optionnel
  niveauEtude: string;
  adresse: string;
  status: string;
  ville: string;
  region?: string; // Nouveau champ optionnel
  paysOrigine: string;
  profession: string;
  employeur?: string; // Nouveau champ optionnel
  situationMatrimoniale: string;
  contactUrgence: string;
  progression_moyenne?: number; // Pour le tri par progression
  nomContactUrgence?: string; // Nouveau champ optionnel
  specialite?: string; // Nouveau champ optionnel
  anneeEtude?: string; // Nouveau champ optionnel
  created_at?: string; // Pour le tri par date de création
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
  const [Open, setOpen] = useState(false);
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
  let order_count = sections.length + 1;
  const [editSectionForm, setEditSectionForm] = useState({
    nom: "",
    description: "",
    ordre: order_count,
    cours_id: "",
    pdf_file: null as File | null,
    video_file: null as File | null,
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
  const [showEditExerciseForm, setShowEditExerciseForm] =
    useState<boolean>(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [editExerciseForm, setEditExerciseForm] = useState<any>({
    nom: "",
    description: "",
    duree_minutes: 30,
    note_sur: 20,
    pdf_file: null,
    questions: [],
  });

  //Edition pour les étudiants
  const [showStudentForm, setShowStudentForm] = useState<boolean>(false);
  const [studentFormTab, setStudentFormTab] = useState<"excel" | "manual">(
    "excel"
  ); // 'excel' ou 'manual'
  const [studentExcelFile, setStudentExcelFile] = useState<File | null>(null);
  const [showOptionalFields, setShowOptionalFields] = useState<boolean>(false);
  const [selectedOptionalFields, setSelectedOptionalFields] = useState<
    string[]
  >([]);
  const [studentForm, setStudentForm] = useState<Student>({
    id: "",
    nom: "",
    filieres: "",
    prenom: "",
    matricule: "",
    nomComplet: "",
    email: "",
    telephone: "",
    sexe: "",
    dateNaissance: "",
    cni: null,
    diplome: null,
    photo: null, // Ajouté
    niveauEtude: "",
    adresse: "",
    ville: "",
    status: "",
    region: "", // Ajouté
    paysOrigine: "",
    profession: "",
    employeur: "", // Ajouté
    situationMatrimoniale: "",
    contactUrgence: "",
    nomContactUrgence: "", // Ajouté
    specialite: "", // Ajouté
    anneeEtude: "", // Ajouté
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"nom" | "date_creation" | "progression">(
    "nom"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filterByFiliere, setFilterByFiliere] = useState<string>("");
  const [showEditStudentForm, setShowEditStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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

  //nom complet = nom + prénom
  useEffect(() => {
    if (studentForm.nom && studentForm.prenom && !studentForm.nomComplet) {
      setStudentForm((prev) => ({
        ...prev,
        nomComplet: `${prev.prenom} ${prev.nom}`,
      }));
    }
  }, [studentForm.nom, studentForm.prenom]);

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

  // Fonction pour importer des étudiants depuis un fichier Excel
  const handleImportExcel = async () => {
    if (!studentExcelFile) {
      alert("Veuillez sélectionner un fichier Excel");
      return;
    }

    if (!user?.id) {
      alert("Erreur d'authentification");
      return;
    }

    try {
      setUploading(true);

      // Importation dynamique de la bibliothèque XLSX (SheetJS)
      const XLSX = await import("xlsx");

      // Lecture du fichier Excel
      const data = await studentExcelFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });

      // Récupération de la première feuille
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Conversion en JSON avec options pour gérer les types
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Utilise la première ligne comme en-tête
        defval: "", // Valeur par défaut pour les cellules vides
        raw: false, // Convertit tout en string
      }) as string[][];

      if (jsonData.length < 2) {
        alert(
          "Le fichier Excel doit contenir au moins une ligne d'en-tête et une ligne de données"
        );
        return;
      }

      // Extraction des en-têtes (première ligne)
      const headers = jsonData[0].map((header) =>
        header.toString().toLowerCase().trim()
      );

      // Vérification des colonnes obligatoires
      const requiredColumns = [
        "nom",
        "prénom",
        "email",
        "téléphone",
        "sexe",
        "date de naissance",
      ];
      const missingColumns = requiredColumns.filter(
        (col) =>
          !headers.some(
            (header) =>
              header.includes(col.toLowerCase()) ||
              header.includes(col.replace("é", "e").toLowerCase())
          )
      );

      if (missingColumns.length > 0) {
        alert(
          `Colonnes manquantes dans le fichier Excel: ${missingColumns.join(
            ", "
          )}`
        );
        return;
      }

      // Mapping des colonnes (gestion des variations de noms)
      const getColumnIndex = (possibleNames: string[]) => {
        return headers.findIndex((header) =>
          possibleNames.some(
            (name) =>
              header.includes(name.toLowerCase()) ||
              header.replace(/[éèê]/g, "e").includes(name.toLowerCase())
          )
        );
      };

      const columnMapping = {
        nom: getColumnIndex(["nom", "name", "lastname"]),
        prenom: getColumnIndex(["prénom", "prenom", "firstname"]),
        email: getColumnIndex(["email", "mail", "e-mail"]),
        telephone: getColumnIndex(["téléphone", "telephone", "phone", "tel"]),
        sexe: getColumnIndex(["sexe", "genre", "gender", "sex"]),
        dateNaissance: getColumnIndex([
          "date de naissance",
          "naissance",
          "birth",
          "birthday",
        ]),
        matricule: getColumnIndex(["matricule", "student_id", "id"]),
        nomComplet: getColumnIndex(["nom complet", "full name", "fullname"]),
        adresse: getColumnIndex(["adresse", "address"]),
        ville: getColumnIndex(["ville", "city"]),
        region: getColumnIndex(["région", "region"]),
        paysOrigine: getColumnIndex(["pays", "country", "pays origine"]),
        profession: getColumnIndex(["profession", "job", "métier"]),
        employeur: getColumnIndex(["employeur", "employer", "company"]),
        niveauEtude: getColumnIndex(["niveau", "education", "diplome"]),
        situationMatrimoniale: getColumnIndex([
          "situation",
          "marital",
          "matrimoniale",
        ]),
        contactUrgence: getColumnIndex([
          "contact urgence",
          "emergency",
          "urgence",
        ]),
        nomContactUrgence: getColumnIndex(["nom contact", "emergency name"]),
        specialite: getColumnIndex([
          "spécialité",
          "specialite",
          "filière",
          "filiere",
        ]),
        anneeEtude: getColumnIndex(["année", "year", "level"]),
      };

      // Fonction utilitaire pour nettoyer et valider les données
      const cleanData = (value: any): string => {
        if (value === null || value === undefined || value === "") return "";
        return value.toString().trim();
      };

      // Fonction de validation de l'email
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      // Fonction de validation du téléphone
      const isValidPhone = (phone: string): boolean => {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
        return phone.length >= 8 && phoneRegex.test(phone);
      };

      // Traitement des données ligne par ligne
      const studentsToInsert = [];
      const errors = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        if (
          !row ||
          row.every((cell) => !cell || cell.toString().trim() === "")
        ) {
          continue; // Ignorer les lignes vides
        }

        try {
          // Extraction des données obligatoires
          const nom = cleanData(row[columnMapping.nom]);
          const prenom = cleanData(row[columnMapping.prenom]);
          const email = cleanData(row[columnMapping.email]);
          const telephone = cleanData(row[columnMapping.telephone]);
          const sexe = cleanData(row[columnMapping.sexe]);
          const dateNaissance = cleanData(row[columnMapping.dateNaissance]);

          // Validation des champs obligatoires
          if (
            !nom ||
            !prenom ||
            !email ||
            !telephone ||
            !sexe ||
            !dateNaissance
          ) {
            errors.push(`Ligne ${i + 1}: Champs obligatoires manquants`);
            continue;
          }

          // Validation de l'email
          if (!isValidEmail(email)) {
            errors.push(`Ligne ${i + 1}: Email invalide (${email})`);
            continue;
          }

          // Validation du téléphone
          if (!isValidPhone(telephone)) {
            errors.push(
              `Ligne ${i + 1}: Numéro de téléphone invalide (${telephone})`
            );
            continue;
          }

          // Validation du sexe
          const sexeNormalized = sexe.toLowerCase();
          let sexeValue = "";
          if (
            sexeNormalized.includes("m") ||
            sexeNormalized.includes("masculin")
          ) {
            sexeValue = "Masculin";
          } else if (
            sexeNormalized.includes("f") ||
            sexeNormalized.includes("féminin") ||
            sexeNormalized.includes("feminin")
          ) {
            sexeValue = "Féminin";
          } else {
            errors.push(
              `Ligne ${
                i + 1
              }: Sexe invalide (${sexe}). Utilisez 'Masculin' ou 'Féminin'`
            );
            continue;
          }

          // Validation et formatage de la date
          let formattedDate = "";
          try {
            const date = new Date(dateNaissance);
            if (isNaN(date.getTime())) {
              throw new Error("Date invalide");
            }
            formattedDate = date.toISOString().split("T")[0];
          } catch {
            errors.push(
              `Ligne ${i + 1}: Date de naissance invalide (${dateNaissance})`
            );
            continue;
          }

          // Construction de l'objet étudiant
          const studentData: any = {
            nom,
            prenom,
            email,
            telephone,
            sexe: sexeValue,
            date_naissance: formattedDate,
            firebase_uid: user.id,
            created_at: new Date().toISOString(),
          };

          // Ajout des champs optionnels s'ils existent
          if (columnMapping.matricule >= 0) {
            const matricule = cleanData(row[columnMapping.matricule]);
            if (matricule) studentData.matricule = matricule;
          }

          if (columnMapping.nomComplet >= 0) {
            const nomComplet = cleanData(row[columnMapping.nomComplet]);
            if (nomComplet) {
              studentData.nom_complet = nomComplet;
            } else {
              studentData.nom_complet = `${prenom} ${nom}`;
            }
          } else {
            studentData.nom_complet = `${prenom} ${nom}`;
          }

          // Autres champs optionnels
          const optionalFields = [
            { key: "adresse", dbKey: "adresse" },
            { key: "ville", dbKey: "ville" },
            { key: "region", dbKey: "region" },
            { key: "paysOrigine", dbKey: "pays_origine" },
            { key: "profession", dbKey: "profession" },
            { key: "employeur", dbKey: "employeur" },
            { key: "niveauEtude", dbKey: "niveau_etude" },
            { key: "situationMatrimoniale", dbKey: "situation_matrimoniale" },
            { key: "contactUrgence", dbKey: "contact_urgence" },
            { key: "nomContactUrgence", dbKey: "nom_contact_urgence" },
            { key: "specialite", dbKey: "specialite" },
            { key: "anneeEtude", dbKey: "annee_etude" },
          ];

          optionalFields.forEach(({ key, dbKey }) => {
            if (columnMapping[key as keyof typeof columnMapping] >= 0) {
              const value = cleanData(
                row[columnMapping[key as keyof typeof columnMapping]]
              );
              if (value) studentData[dbKey] = value;
            }
          });

          studentsToInsert.push(studentData);
        } catch (error) {
          errors.push(
            `Ligne ${i + 1}: Erreur de traitement - ${
              error instanceof Error ? error.message : "Erreur inconnue"
            }`
          );
        }
      }

      // Affichage des erreurs s'il y en a
      if (errors.length > 0) {
        const showAllErrors = confirm(
          `${errors.length} erreur(s) détectée(s):\n\n${errors
            .slice(0, 5)
            .join("\n")}${
            errors.length > 5
              ? "\n\n... et " + (errors.length - 5) + " autres erreurs."
              : ""
          }\n\nVoulez-vous continuer l'import des étudiants valides (${
            studentsToInsert.length
          }) ?`
        );

        if (!showAllErrors) {
          return;
        }
      }

      if (studentsToInsert.length === 0) {
        alert("Aucun étudiant valide à importer");
        return;
      }

      // Insertion en base de données par lots pour éviter les timeouts
      const batchSize = 50;
      let insertedCount = 0;
      let duplicateCount = 0;

      for (let i = 0; i < studentsToInsert.length; i += batchSize) {
        const batch = studentsToInsert.slice(i, i + batchSize);

        try {
          const { data, error } = await supabase
            .from("etudiants")
            .insert(batch)
            .select("id");

          if (error) {
            // Gestion des doublons (contrainte unique sur email)
            if (error.code === "23505") {
              duplicateCount += batch.length;
              console.warn(
                `Lot ${Math.floor(i / batchSize) + 1}: Doublons détectés`
              );
            } else {
              throw error;
            }
          } else {
            insertedCount += data?.length || 0;
          }
        } catch (error) {
          console.error(
            `Erreur lors de l'insertion du lot ${
              Math.floor(i / batchSize) + 1
            }:`,
            error
          );
          // Continuer avec les autres lots même en cas d'erreur
        }
      }

      // Message de fin d'import
      let message = `Import terminé!\n\n`;
      message += `✅ ${insertedCount} étudiant(s) importé(s) avec succès\n`;
      if (duplicateCount > 0) {
        message += `⚠️ ${duplicateCount} doublon(s) ignoré(s)\n`;
      }
      if (errors.length > 0) {
        message += `❌ ${errors.length} erreur(s) de validation\n`;
      }
      message += `\nTotal traité: ${
        studentsToInsert.length + errors.length
      } ligne(s)`;

      alert(message);

      // Fermeture du modal et réinitialisation
      setShowStudentForm(false);
      setStudentExcelFile(null);

      // Optionnel: Recharger la liste des étudiants si elle existe
      await loadStudents();
    } catch (error) {
      console.error("Erreur lors de l'import Excel:", error);
      alert(
        `Erreur lors de l'import: ${
          error instanceof Error ? error.message : "Erreur inconnue"
        }`
      );
    } finally {
      setUploading(false);
    }
  };

  // Charger les étudiants depuis Supabase
  const loadStudents = async () => {
    if (!user?.id) return;

    try {
      setLoadingStudents(true);
      const { data, error } = await supabase
        .from("etudiants")
        .select(
          `
        *,
        etudiant_filieres(
          filieres(nom)
        ),
        etudiant_modules(
          progression,
          status
        )
      `
        )
        .eq("firebase_uid", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const studentsWithStats = data.map((student: any) => ({
        ...student,
        filieres: student.etudiant_filieres.map((ef: any) => ef.filieres.nom),
        progression_moyenne:
          student.etudiant_modules.length > 0
            ? student.etudiant_modules.reduce(
                (acc: number, em: any) => acc + em.progression,
                0
              ) / student.etudiant_modules.length
            : 0,
        modules_termines: student.etudiant_modules.filter(
          (em: any) => em.status === "termine"
        ).length,
      }));

      setStudents(studentsWithStats);
    } catch (error) {
      console.error("Erreur chargement étudiants:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filtrer et trier les étudiants
  const applyFiltersAndSort = () => {
    let filtered = [...students];

    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrage par filière
    if (filterByFiliere) {
      filtered = filtered.filter((student) =>
        student.filieres?.includes(filterByFiliere)
      );
    }

    // Tri
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case "nom":
          valueA = a.nom.toLowerCase();
          valueB = b.nom.toLowerCase();
          break;
        case "date_creation":
          valueA = new Date(a.created_at || 0);
          valueB = new Date(b.created_at || 0);
          break;
        case "progression":
          valueA = a.progression_moyenne || 0;
          valueB = b.progression_moyenne || 0;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredStudents(filtered);
  };

  // Supprimer un étudiant
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return;

    try {
      const { error } = await supabase
        .from("etudiants")
        .delete()
        .eq("id", studentId)
        .eq("firebase_uid", user?.id);

      if (error) throw error;

      await loadStudents();
    } catch (error) {
      console.error("Erreur suppression étudiant:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // Obtenir les informations remplies d'un étudiant
  const getFilledFields = (student: Student) => {
    const fields: { label: string; value: string }[] = [];

    const fieldMapping = {
      matricule: "Matricule",
      email: "Email",
      telephone: "Téléphone",
      sexe: "Sexe",
      date_naissance: "Date de naissance",
      adresse: "Adresse",
      ville: "Ville",
      region: "Région",
      pays_origine: "Pays d'origine",
      profession: "Profession",
      niveau_etude: "Niveau d'étude",
      specialite: "Spécialité",
      filieres: "Filières",
      annee_etude: "Année d'étude",
      situation_matrimoniale: "Situation matrimoniale",
      contact_urgence: "Contact d'urgence",
    };

    Object.entries(fieldMapping).forEach(([key, label]) => {
      const value = student[key as keyof Student];
      if (value && value !== "") {
        fields.push({ label, value: value.toString() });
      }
    });

    return fields;
  };

  // 4. EFFECT À AJOUTER
  useEffect(() => {
    if (user?.id) {
      loadStudents();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [students, searchTerm, sortBy, sortOrder, filterByFiliere]);

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

  const getStringValue = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    return "";
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
            <button className="mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
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
          <div className="w-24 h-24 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
      name: "Formations",
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
      id: "personnalisation",
      name: "Personnalisation",
      icon: PencilRuler,
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
    personnalisation: {
      title: "Personnalisez votre espace",
      description:
        "Ajoutez le logo et les couleurs de votre établissement pour adapter le formulaire à votre identité visuelle.",
      cta: "Commencer à Personnaliser",
      icon: PencilRuler,
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
      cta: "Ajouter des étudiants",
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
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs hover:shadow-sm group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Modules</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {modules.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <BookMarked className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          {/*<p className="text-xs text-gray-500 mt-2">+2 ce mois</p>*/}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs hover:shadow-sm group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cours</p>
              <p className="text-3xl  font-bold text-gray-900 mt-1">
                {courses.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <GraduationCap className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs hover:shadow-sm transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Filières</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {filieres.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs hover:shadow-sm transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Étudiants</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {students.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowModuleForm(true)}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-100 transition-colors">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Créer un module
              </p>
              <p className="text-sm text-gray-600">
                Nouveau contenu de formation
              </p>
            </div>
          </button>

          <button
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left group"
            onClick={() => setShowStudentForm(true)}
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-emerald-100 transition-colors">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Ajouter des étudiants
              </p>
              <p className="text-sm text-gray-600">Étendre votre audience</p>
            </div>
          </button>

          <button
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left group"
            onClick={() => setShowFiliereForm(true)}
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-100 transition-colors">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-1">
                Nouvelle filière
              </p>
              <p className="text-sm text-gray-600">Organiser vos formations</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modules récents */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Modules récents
          </h2>
          <button
            onClick={() => {
              setActiveMainTab("cours-modules");
              setActiveTab("mes-modules");
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Voir tout
          </button>
        </div>
        <div className="space-y-3">
          {modules.slice(0, 3).map((module) => (
            <div
              key={module.id}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-semibold text-sm mr-4 shadow-sm">
                  {module.nom.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">
                    {module.nom}
                  </p>
                  <p className="text-sm text-gray-600">
                    {module.nombre_cours} cours • {module.duration}h
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {module.filieres?.slice(0, 2).map((filiere, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
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
        /* Grille des modules - Design équilibré HIG + Material Design */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden group"
            >
              {/* Image d'en-tête avec overlay moderne */}
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-700 overflow-hidden">
                {/* Image ou gradient par défaut */}
                {module.image_url ? (
                  <img
                    src={module.image_url}
                    alt={`Module ${module.nom}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/60">
                        <BookMarked size={56} />
                      </div>
                    </div>
                    {/* Pattern décoratif */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] opacity-30"></div>
                  </div>
                )}

                {/* Overlay gradient subtil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

                {/* Badge nombre de cours - style Material */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white rounded-full px-3 py-1.5 shadow-sm">
                    <span className="text-gray-700 text-sm font-semibold">
                      {module.nombre_cours || 0} cours
                    </span>
                  </div>
                </div>

                {/* Actions en overlay - apparition fluide */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                  <div className="flex gap-2">
                    <button
                      className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-white transition-all duration-200 shadow-sm"
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
                      className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-white transition-all duration-200 shadow-sm"
                      title="Supprimer le module"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenu de la carte */}
              <div className="p-5">
                {/* Header avec titre */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 leading-snug">
                    {module.nom}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {module.description}
                  </p>
                </div>

                {/* Métadonnées avec icônes Material */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <Clock size={14} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-600">
                      <span className="font-medium text-gray-900">
                        {module.duration}
                      </span>{" "}
                      heures
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                      <Users size={14} className="text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-600">
                      Par{" "}
                      <span className="font-medium text-gray-900">
                        {module.author}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Tags des filières - style chips Material */}
                {module.filieres && module.filieres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {module.filieres.slice(0, 2).map((filiere, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {filiere.nom}
                      </span>
                    ))}
                    {module.filieres.length > 2 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                        +{module.filieres.length - 2} autres
                      </span>
                    )}
                  </div>
                )}

                {/* Séparateur subtil */}
                <div className="border-t border-gray-100 pt-4">
                  {/* Actions hiérarchisées */}
                  <div className="flex gap-2">
                    {/* Action principale */}
                    <button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                      onClick={() => handleConsulterCours(module)}
                    >
                      <BookOpen size={16} />
                      <span className="hidden sm:inline">Voir les cours</span>
                      <span className="sm:hidden">Cours</span>
                    </button>

                    {/* Actions secondaires */}
                    <button
                      className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                      onClick={() => {
                        setEditingModule(module);
                        setEditModuleForm({
                          image_url: module.image_url as File,
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
                      className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                      title="Supprimer le module"
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
          <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des Filières
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base leading-relaxed">
                  Organisez vos filières et visualisez les modules associés
                </p>
              </div>
              <button
                onClick={() => setShowFiliereForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus size={20} />
                <span>Nouvelle filière</span>
              </button>
            </div>

            {/* Grid avec hauteur minimale pour éviter l'aplatissement */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filieres.map((filiere) => {
                // Calcul des modules associés
                const modulesAssocie = modules.filter(
                  (module) =>
                    module.filieres?.some((f) => f.nom === filiere.nom) || false
                ).length;

                return (
                  <div
                    key={filiere.id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden group min-h-[280px] flex flex-col"
                  >
                    {/* Contenu principal - flex-1 pour éviter l'aplatissement */}
                    <div className="flex-1 flex flex-col p-6 pt-4">
                      {/* Titre et description */}
                      <div className="mb-5">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-1">
                          {filiere.nom}
                        </h3>

                        {filiere.description && (
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                            {filiere.description}
                          </p>
                        )}
                      </div>

                      {/* Statistiques avec icônes Material */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
                            <BookMarked size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {modulesAssocie} module
                              {modulesAssocie !== 1 ? "s" : ""}
                            </p>
                            <p className="text-xs text-gray-500">Disponibles</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              0 étudiants
                            </p>
                            <p className="text-xs text-gray-500">Inscrits</p>
                          </div>
                        </div>
                      </div>

                      {/* Spacer pour pousser les actions en bas */}
                      <div className="flex-1"></div>

                      {/* Séparateur */}
                      <div className="border-t border-gray-100 pt-4">
                        {/* Actions hiérarchisées */}
                        <div className="flex gap-2">
                          {/* Action principale */}
                          <button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                            onClick={() => handleConsulterModules(filiere)}
                            title="Consulter les modules"
                          >
                            <FolderOpen size={16} />
                            <span className="hidden sm:inline">Modules</span>
                            <span className="sm:hidden">Voir</span>
                          </button>

                          {/* Actions secondaires */}
                          <button
                            className="px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
                            onClick={() => handleEditFiliere(filiere)}
                            title="Modifier la filière"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteFiliere(filiere.id)}
                            className="px-3 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                            title="Supprimer la filière"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
        /* Liste des cours - Design équilibré HIG + Material Design */
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-blue-200 transition-all duration-300 overflow-hidden"
            >
              {/* Header avec couleur d'accent subtile */}
              <div className=" px-4 sm:px-6 py-4 border-b border-gray-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg truncate">
                        {course.nom}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 self-start">
                        {getModuleName(course.module_id)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-emerald-600 font-medium">Publié</span>
                  </div>
                </div>
              </div>

              {/* Content principal */}
              <div className="p-4 sm:p-6">
                {/* Métadonnées avec icônes Material */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Clock size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Durée</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {course.duration}h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                      <Users size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Auteur</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {course.author}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                      <Calendar size={18} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Créé le</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDateTime(course.date_creation)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                      <FileText size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Contenu</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {courseSectionCounts[course.id] || 0} sections
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions avec hiérarchie Material Design */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Primary action */}
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3"
                    onClick={() => handleConsulterSection(course)}
                  >
                    <FileText size={20} />
                    <span>Consulter le cours</span>
                    {courseSectionCounts[course.id] > 0 && (
                      <span className="bg-white bg-opacity-20 px-2 py-1 rounded-md text-sm font-semibold">
                        {courseSectionCounts[course.id]}
                      </span>
                    )}
                  </button>

                  {/* Secondary actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300"
                      title="Modifier le cours"
                    >
                      <Pencil size={18} />
                      <span className="hidden sm:inline">Modifier</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 border border-red-200 hover:border-red-300"
                      title="Supprimer le cours"
                    >
                      <Trash2 size={18} />
                      <span className="hidden sm:inline">Supprimer</span>
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

  const handledeletePDFSection = async (section: Section): Promise<void> => {
    if (!section.pdf_url) {
      alert("Aucun PDF à supprimer pour cette section");
      return;
    }

    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le document PDF de la section "${section.nom}" ?`
      )
    ) {
      return;
    }

    try {
      // 1. Supprimer le fichier du storage
      const { error: storageError } = await supabase.storage
        .from("section_pdfs")
        .remove([`pdfs/${section.pdf_url}`]);

      if (storageError) {
        console.error("Erreur suppression fichier:", storageError);
        // On continue même si la suppression du fichier échoue
      }

      // 2. Mettre à jour la section dans la base de données
      const { error: updateError } = await supabase
        .from("sections")
        .update({
          pdf_url: null,
          has_pdf: false,
        })
        .eq("id", section.id)
        .eq("created_by", user?.id);

      if (updateError) {
        console.error("Erreur mise à jour section:", updateError);
        throw updateError;
      }

      // 3. Recharger les sections pour mettre à jour l'affichage
      if (selectedCourse?.id) {
        await loadSectionsForCourse(selectedCourse.id);
      }

      console.log("✅ PDF supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du PDF:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      alert(`Erreur lors de la suppression du PDF: ${errorMessage}`);
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
      .from(bucket as string)
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
    } = supabase.storage.from(bucket as string).getPublicUrl(fileName);

    return {
      fileName: fileName,
      publicUrl: publicUrl,
    };
  };

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

    // ✅ NOUVELLE VALIDATION : Vérifier les réponses correctes pour les QCM
    if (exerciseType === "qcm") {
      const questionsWithoutCorrectAnswers = [];

      for (let i = 0; i < exerciseForm.questions.length; i++) {
        const question = exerciseForm.questions[i];

        // Vérifier que la question a des options
        if (!question.options || question.options.length === 0) {
          questionsWithoutCorrectAnswers.push(
            `Question ${i + 1}: Aucune option définie`
          );
          continue;
        }

        // Vérifier qu'au moins une option est marquée comme correcte
        const hasCorrectAnswer = question.options.some(
          (option) => option.is_correct === true
        );

        if (!hasCorrectAnswer) {
          questionsWithoutCorrectAnswers.push(
            `Question ${i + 1}: "${question.texte}"`
          );
        }
      }

      if (questionsWithoutCorrectAnswers.length > 0) {
        alert(
          `Les questions suivantes n'ont pas de réponse correcte sélectionnée :\n\n${questionsWithoutCorrectAnswers.join(
            "\n"
          )}\n\nVeuillez sélectionner au moins une réponse correcte pour chaque question.`
        );
        return;
      }
    }

    // ✅ VALIDATION BONUS : Vérifier que chaque question QCM a au moins 2 options
    if (exerciseType === "qcm") {
      const questionsWithInsufficientOptions = [];

      for (let i = 0; i < exerciseForm.questions.length; i++) {
        const question = exerciseForm.questions[i];

        if (!question.options || question.options.length < 2) {
          questionsWithInsufficientOptions.push(
            `Question ${i + 1}: "${question.texte}"`
          );
        }
      }

      if (questionsWithInsufficientOptions.length > 0) {
        alert(
          `Les questions suivantes ont moins de 2 options :\n\n${questionsWithInsufficientOptions.join(
            "\n"
          )}\n\nChaque question QCM doit avoir au moins 2 options.`
        );
        return;
      }
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

  // Fonction pour ouvrir le formulaire d'édition avec les données existantes
  const openEditExerciseForm = async (exercise: any) => {
    try {
      setEditingExercise(exercise);

      // Charger les questions et options existantes pour les QCM/QRO
      let existingQuestions: any[] = [];

      if (exercise.type === "qcm" || exercise.type === "qro") {
        // Récupérer les questions existantes
        const { data: questionsData, error: questionsError } = await supabase
          .from("exercise_questions")
          .select("*")
          .eq("exercise_id", exercise.id)
          .order("ordre");

        if (questionsError) {
          console.error("Erreur chargement questions:", questionsError);
        } else if (questionsData) {
          existingQuestions = questionsData;

          // Pour les QCM, récupérer aussi les options
          if (exercise.type === "qcm") {
            const questionIds = questionsData.map((q) => q.id);

            if (questionIds.length > 0) {
              const { data: optionsData, error: optionsError } = await supabase
                .from("exercise_options")
                .select("*")
                .in("question_id", questionIds)
                .order("ordre");

              if (optionsError) {
                console.error("Erreur chargement options:", optionsError);
              } else if (optionsData) {
                // Associer les options aux questions
                existingQuestions = existingQuestions.map((question) => ({
                  ...question,
                  options: optionsData
                    .filter((option) => option.question_id === question.id)
                    .map((option) => ({
                      id: option.id || Date.now() + Math.random(),
                      texte: option.texte,
                      ordre: option.ordre,
                      is_correct: option.is_correct,
                    })),
                }));
              }
            }
          }
        }
      }

      // Initialiser le formulaire avec les données existantes
      setEditExerciseForm({
        nom: exercise.nom || "",
        description: exercise.description || "",
        duree_minutes: exercise.duree_minutes || 30,
        note_sur: exercise.note_sur || 20,
        pdf_file: null, // Pas de nouveau fichier par défaut
        questions: existingQuestions.map((question) => ({
          id: question.id || Date.now() + Math.random(),
          texte: question.texte || "",
          ordre: question.ordre || 1,
          type:
            question.type ||
            (exercise.type === "qcm" ? "multiple_choice" : "open_text"),
          multiple_answers: question.multiple_answers || false,
          options: question.options || [],
        })),
      });

      setShowEditExerciseForm(true);

      console.log("✅ Formulaire d'édition initialisé avec:", {
        exercise: exercise.nom,
        questionsCount: existingQuestions.length,
        type: exercise.type,
      });
    } catch (error) {
      console.error("Erreur ouverture formulaire édition:", error);
      alert("Erreur lors du chargement des données de l'exercice");
    }
  };

  const handleUpdateExercise = async (): Promise<void> => {
    if (!editExerciseForm.nom.trim() || !editingExercise) {
      alert("Veuillez remplir le nom de l'exercice");
      return;
    }

    // Validation spécifique selon le type
    if (
      editingExercise.type === "pdf" &&
      !editingExercise.pdf_url &&
      !editExerciseForm.pdf_file
    ) {
      alert("Veuillez sélectionner un fichier PDF ou conserver l'existant");
      return;
    }

    if (
      (editingExercise.type === "qcm" || editingExercise.type === "qro") &&
      editExerciseForm.questions.length === 0
    ) {
      alert("Veuillez ajouter au moins une question");
      return;
    }

    // ✅ VALIDATION : Vérifier les réponses correctes pour les QCM
    if (editingExercise.type === "qcm") {
      const questionsWithoutCorrectAnswers: string[] = [];

      for (let i = 0; i < editExerciseForm.questions.length; i++) {
        const question = editExerciseForm.questions[i];

        // Vérifier que la question a des options
        if (!question.options || question.options.length === 0) {
          questionsWithoutCorrectAnswers.push(
            `Question ${i + 1}: Aucune option définie`
          );
          continue;
        }

        // Vérifier qu'au moins une option est marquée comme correcte
        const hasCorrectAnswer = question.options.some(
          (option: any) => option.is_correct === true
        );

        if (!hasCorrectAnswer) {
          questionsWithoutCorrectAnswers.push(
            `Question ${i + 1}: "${question.texte}"`
          );
        }
      }

      if (questionsWithoutCorrectAnswers.length > 0) {
        alert(
          `Les questions suivantes n'ont pas de réponse correcte sélectionnée :\n\n${questionsWithoutCorrectAnswers.join(
            "\n"
          )}\n\nVeuillez sélectionner au moins une réponse correcte pour chaque question.`
        );
        return;
      }
    }

    // ✅ VALIDATION : Vérifier que chaque question QCM a au moins 2 options
    if (editingExercise.type === "qcm") {
      const questionsWithInsufficientOptions: string[] = [];

      for (let i = 0; i < editExerciseForm.questions.length; i++) {
        const question = editExerciseForm.questions[i];

        if (!question.options || question.options.length < 2) {
          questionsWithInsufficientOptions.push(
            `Question ${i + 1}: "${question.texte}"`
          );
        }
      }

      if (questionsWithInsufficientOptions.length > 0) {
        alert(
          `Les questions suivantes ont moins de 2 options :\n\n${questionsWithInsufficientOptions.join(
            "\n"
          )}\n\nChaque question QCM doit avoir au moins 2 options.`
        );
        return;
      }
    }

    try {
      setUploading(true);

      let pdfUrl: string | null = editingExercise.pdf_url; // ✅ Conserver l'ancien PDF par défaut

      // Upload du nouveau PDF si présent
      if (editExerciseForm.pdf_file) {
        console.log("Upload du nouveau PDF en cours...");
        const pdfResult = await uploadFile(
          editExerciseForm.pdf_file,
          "exercise_pdfs",
          "exercises/"
        );
        if (pdfResult) {
          // Supprimer l'ancien PDF s'il existait
          if (editingExercise.pdf_url) {
            console.log(
              "Suppression de l'ancien PDF:",
              editingExercise.pdf_url
            );
            const { error: deleteError } = await supabase.storage
              .from("exercise_pdfs")
              .remove([`exercises/${editingExercise.pdf_url}`]);

            if (deleteError) {
              console.warn("Erreur suppression ancien PDF:", deleteError);
            }
          }
          pdfUrl = pdfResult.fileName;
          console.log("Nouveau PDF uploadé:", pdfResult.fileName);
        }
      }

      // Mettre à jour l'exercice principal
      const { error: exerciseError } = await supabase
        .from("exercises")
        .update({
          nom: editExerciseForm.nom.trim(),
          description: editExerciseForm.description?.trim() || null,
          pdf_url: pdfUrl,
          duree_minutes:
            editingExercise.type !== "pdf"
              ? editExerciseForm.duree_minutes
              : null,
          note_sur:
            editingExercise.type !== "pdf" ? editExerciseForm.note_sur : null,
        })
        .eq("id", editingExercise.id)
        .eq("created_by", user?.id);

      if (exerciseError) throw exerciseError;

      // Gestion des questions pour QCM et QRO
      if (editingExercise.type === "qcm" || editingExercise.type === "qro") {
        // 1. Supprimer toutes les anciennes questions et leurs options
        if (editingExercise.type === "qcm") {
          // Supprimer d'abord les options (à cause des foreign keys)
          const { error: deleteOptionsError } = await supabase
            .from("exercise_options")
            .delete()
            .in(
              "question_id",
              (
                await supabase
                  .from("exercise_questions")
                  .select("id")
                  .eq("exercise_id", editingExercise.id)
              ).data?.map((q) => q.id) || []
            );

          if (deleteOptionsError) {
            console.warn("Erreur suppression options:", deleteOptionsError);
          }
        }

        // Supprimer les questions
        const { error: deleteQuestionsError } = await supabase
          .from("exercise_questions")
          .delete()
          .eq("exercise_id", editingExercise.id);

        if (deleteQuestionsError) throw deleteQuestionsError;

        // 2. Recréer les nouvelles questions
        if (editExerciseForm.questions.length > 0) {
          const questionsToInsert = editExerciseForm.questions.map(
            (q: any) => ({
              exercise_id: editingExercise.id,
              texte: q.texte,
              ordre: q.ordre,
              type: q.type,
              multiple_answers: q.multiple_answers || false,
            })
          );

          const { data: questionsData, error: questionsError } = await supabase
            .from("exercise_questions")
            .insert(questionsToInsert)
            .select();

          if (questionsError) throw questionsError;

          // 3. Créer les nouvelles options pour les QCM
          if (editingExercise.type === "qcm") {
            const optionsToInsert: any[] = [];

            editExerciseForm.questions.forEach(
              (question: any, qIdx: number) => {
                const questionId = questionsData[qIdx].id;

                question.options?.forEach((option: any) => {
                  optionsToInsert.push({
                    question_id: questionId,
                    texte: option.texte,
                    ordre: option.ordre,
                    is_correct: option.is_correct,
                  });
                });
              }
            );

            if (optionsToInsert.length > 0) {
              const { error: optionsError } = await supabase
                .from("exercise_options")
                .insert(optionsToInsert);

              if (optionsError) throw optionsError;
            }
          }
        }
      }

      // Recharger les données
      if (selectedCourse?.id) {
        await loadSectionsForCourse(selectedCourse.id);
      }

      // Fermer le modal et réinitialiser
      setShowEditExerciseForm(false);
      setEditingExercise(null);
      setEditExerciseForm({
        nom: "",
        description: "",
        duree_minutes: 30,
        note_sur: 20,
        pdf_file: null,
        questions: [],
      });

      console.log("✅ Exercice modifié avec succès");
    } catch (error: unknown) {
      console.error("Erreur modification exercice:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      alert(`Erreur lors de la modification de l'exercice: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  /*const loadExercisesForSection = async (
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
  };*/

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
    return getFilePublicUrl("exercise_pdfs", exercise.pdf_url);
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
            value={selectedCourse?.id || " "}
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
                  formations
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
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {sections.length}
                </div>
                <div className="text-xs text-gray-600">Sections</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {sections.filter((s) => s.has_pdf).length}
                </div>
                <div className="text-xs text-gray-600">Documents</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {sections.filter((s) => s.has_video).length}
                </div>
                <div className="text-xs text-gray-600">Vidéos</div>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">
                  {exercises.length}
                </div>
                <div className="text-xs text-gray-600">Exercices</div>
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
                            <div className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                    <FileText
                                      size={20}
                                      className="text-red-500"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {getPdfFileName(section)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Document PDF
                                    </p>
                                  </div>
                                </div>

                                {/* Actions pour le PDF */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const pdfUrl = getPdfUrl(section);
                                      if (pdfUrl) {
                                        handleDownloadFile(
                                          pdfUrl,
                                          getPdfFileName(section) ||
                                            "document.pdf"
                                        );
                                      }
                                    }}
                                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                  >
                                    <Eye size={16} />
                                  </button>

                                  {/* Bouton de suppression du PDF */}
                                  <button
                                    onClick={() =>
                                      handledeletePDFSection(section)
                                    }
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Supprimer le document PDF"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
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
                                            onClick={() =>
                                              handleDownloadExercise(exercise)
                                            }
                                            className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs transition-colors flex items-center gap-1"
                                            title="ouvrir l'exercice PDF"
                                          >
                                            <Eye size={12} />
                                          </button>
                                        ) : null}

                                        {/* Menu actions */}
                                        <button
                                          onClick={() => {
                                            openEditExerciseForm(exercise);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
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
                              <button
                                className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-md text-sm transition-colors flex items-center gap-1"
                                onClick={() => handleEditSection(section)}
                              >
                                <FileText size={14} />
                                Ajouter un document
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

  const renderStudentsContent = () => (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes étudiants</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos étudiants inscrits et suivez leurs progressions
          </p>
        </div>
        <button
          onClick={() => setShowStudentForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md font-medium transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} />
          Ajouter des étudiants
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou matricule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtre par filière */}
          <div className="lg:w-48">
            <select
              value={filterByFiliere}
              onChange={(e) => setFilterByFiliere(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les filières</option>
              {filieres.map((filiere) => (
                <option key={filiere.id} value={filiere.nom}>
                  {filiere.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Tri */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="nom">Nom</option>
              <option value="date_creation">Date d'inscription</option>
              <option value="progression">Performance</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              {sortOrder === "asc" ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total étudiants</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Étudiants actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {students.filter((s) => s.status === "actif").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progression moyenne</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  students.reduce(
                    (acc, s) => acc + (s.progression_moyenne || 0),
                    0
                  ) / students.length
                ) || 0}
                %
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Nouveaux ce mois</p>
              <p className="text-2xl font-bold text-gray-900">
                {
                  students.filter(
                    (s) =>
                      new Date(s.created_at || 0).getMonth() ===
                      new Date().getMonth()
                  ).length
                }
              </p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Liste des étudiants */}
      {loadingStudents ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des étudiants...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {students.length === 0
              ? "Aucun étudiant inscrit"
              : "Aucun résultat"}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {students.length === 0
              ? "Commencez par ajouter vos premiers étudiants via Excel ou saisie manuelle."
              : "Aucun étudiant ne correspond aux critères de filtrage."}
          </p>
          {students.length === 0 && (
            <button
              onClick={() => setShowStudentForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Ajouter des étudiants
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredStudents.map((student) => {
            const filledFields = getFilledFields(student);

            return (
              <div
                key={student.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                      <UserRound className="w-8 h-8" />
                    </div>

                    <div className="flex-1">
                      {/* En-tête étudiant */}
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {student.prenom} {student.nom}
                        </h3>

                        {student.matricule && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                            {student.matricule}
                          </span>
                        )}

                        {/*<span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            student.status === "actif"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {student.status}
                        </span> */}
                      </div>

                      {/* Informations remplies */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {filledFields.slice(0, 6).map((field, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-gray-500">
                              {field.label}:{" "}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {field.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Filières et progression */}
                      <div className="flex items-center gap-4">
                        {student.filieres && student.filieres.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(student.filieres) &&
                              student.filieres.map(
                                (filiere: string, index: number) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                  >
                                    {filiere}
                                  </span>
                                )
                              )}
                          </div>
                        )}

                        {student.progression_moyenne !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-92 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${student.progression_moyenne}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round(student.progression_moyenne)}%
                            </span>
                          </div>
                        )}

                        {student.progression_moyenne !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="w-92 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${student.progression_moyenne}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {Math.round(student.progression_moyenne)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowStudentDetails(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      title="Voir les détails"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setEditingStudent(student);
                        setShowEditStudentForm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Informations supplémentaires si plus de 6 champs */}
                {filledFields.length > 6 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setShowStudentDetails(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Voir {filledFields.length - 6} information(s)
                      supplémentaire(s)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

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

      // ✅ CORRECTION : Conserver les URLs existantes par défaut
      let updatedData = {
        nom: nom.trim(),
        description: description?.trim() || null,
        ordre: ordre,
        cours_id: cours_id,
        pdf_url: editingSection.pdf_url, // ✅ Conserver l'ancienne URL
        has_pdf: editingSection.has_pdf, // ✅ Conserver l'ancien statut
        video_url: editingSection.video_url, // ✅ Conserver l'ancienne URL
        has_video: editingSection.has_video, // ✅ Conserver l'ancien statut
      };

      // Si un nouveau PDF est uploadé
      if (pdf_file) {
        console.log("Upload du nouveau PDF en cours...");
        const pdfResult = await uploadFile(pdf_file, "section_pdfs", "pdfs/");
        if (pdfResult) {
          // Supprimer l'ancien PDF si il existe
          if (editingSection.pdf_url) {
            console.log("Suppression de l'ancien PDF:", editingSection.pdf_url);
            const { error: deleteError } = await supabase.storage
              .from("section_pdfs")
              .remove([`pdfs/${editingSection.pdf_url}`]); // ✅ Ajouter le préfixe pdfs/

            if (deleteError) {
              console.warn("Erreur suppression ancien PDF:", deleteError);
            }
          }

          updatedData.pdf_url = pdfResult.fileName ?? "undefined.pdf";
          updatedData.has_pdf = true;
          console.log("Nouveau PDF uploadé:", pdfResult.fileName);
        }
      }

      // Si une nouvelle vidéo est uploadée
      if (video_file) {
        console.log("Upload de la nouvelle vidéo en cours...");
        const videoResult = await uploadFile(
          video_file,
          "section_videos",
          "videos/"
        );
        if (videoResult) {
          // Supprimer l'ancienne vidéo si elle existe
          if (editingSection.video_url) {
            console.log(
              "Suppression de l'ancienne vidéo:",
              editingSection.video_url
            );
            const { error: deleteError } = await supabase.storage
              .from("section_videos")
              .remove([`videos/${editingSection.video_url}`]); // ✅ Ajouter le préfixe videos/

            if (deleteError) {
              console.warn("Erreur suppression ancienne vidéo:", deleteError);
            }
          }

          updatedData.video_url = videoResult.fileName ?? "undefined.mp4";
          updatedData.has_video = true;
          console.log("Nouvelle vidéo uploadée:", videoResult.fileName);
        }
      }

      console.log("Données à mettre à jour:", updatedData);

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
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue s'est produite";
      alert(`Erreur lors de la modification de la section: ${errorMessage}`);
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

    //Pour les étudiants
    if (activeMainTab === "etudiants") {
      return renderStudentsContent();
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
            if (activeTab === "etudiants") setShowStudentForm(true);
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
    <div className="h-screen bg-gray-50 flex">
      {/*  redesignée */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          Open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 font-bold text-white text-md rounded-md flex items-center justify-center">
              F
            </div>
            <span className="ml-3 font-bold text-slate-900 text-lg">
              FastLMS
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {mainTabs.map((tab) => (
            <div key={tab.id} className="mb-2">
              {/* Bouton principal avec design Material */}
              <button
                onClick={() => {
                  setActiveMainTab(tab.id);
                  if (tab.subTabs) {
                    setActiveTab(tab.subTabs[0].id);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${
                  activeMainTab === tab.id
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {/* Conteneur d'icône avec fond coloré pour l'état actif */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                    activeMainTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                  }`}
                >
                  <tab.icon size={18} />
                </div>

                <span className="truncate">{tab.name}</span>

                {/* Indicateur d'expansion pour les sous-menus */}
                {tab.subTabs && (
                  <div
                    className={`ml-auto transition-transform duration-200 ${
                      activeMainTab === tab.id ? "rotate-90" : ""
                    }`}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          activeMainTab === tab.id
                            ? "bg-blue-600"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </button>

              {/* Sous-menu avec animation d'apparition */}
              {tab.subTabs && activeMainTab === tab.id && (
                <div className="ml-3 mt-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
                  {tab.subTabs.map((subTab, index) => (
                    <button
                      key={subTab.id}
                      onClick={() => setActiveTab(subTab.id)}
                      className={`w-full flex items-center px-4 py-2.5 text-sm rounded-lg transition-all duration-200 group relative ${
                        activeTab === subTab.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      {/* Ligne de connexion visuelle */}
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full" />
                      {activeTab === subTab.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-full" />
                      )}

                      {/* Conteneur d'icône pour sous-menu */}
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center mr-3 transition-all duration-200 ${
                          activeTab === subTab.id
                            ? "bg-blue-100 text-blue-600"
                            : "bg-transparent text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-600"
                        }`}
                      >
                        <subTab.icon size={16} />
                      </div>

                      <span className="truncate">{subTab.name}</span>

                      {/* Badge de notification (optionnel) */}
                      {activeTab === subTab.id && (
                        <div className="ml-auto">
                          <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
      {/* Overlay mobile */}
      {Open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header redesigné */}
        <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-0 lg:left-64 z-30 shadow-xs">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center">
              <button
                onClick={() => setOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg mr-2 transition-all duration-200"
              >
                <Menu size={20} />
              </button>

              {/* Breadcrumb amélioré */}
              <div className="hidden md:flex items-center text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <span className="font-semibold text-gray-900">
                    {mainTabs.find((t) => t.id === activeMainTab)?.name}
                  </span>
                  {activeMainTab === "cours-modules" && (
                    <>
                      <ChevronRight size={14} className="text-gray-400" />
                      <span className="text-gray-600">
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
            </div>

            <div className="flex items-center gap-3">
              {/* Search avec design Material */}
              <div className="relative hidden md:block">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2.5 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-sm placeholder-gray-500"
                />
              </div>

              {/* Actions avec design cohérent */}
              <div className="flex items-center gap-1">
                {/* Visioconférence */}
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2.5 rounded-lg transition-all duration-200 group"
                  title="Organiser une visioconférence"
                >
                  <Video
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>

                {/* Calendrier */}
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2.5 rounded-lg transition-all duration-200 group"
                  title="Programmer un évènement"
                >
                  <Calendar
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>

              {/* Séparateur visuel */}
              <div className="w-px h-6 bg-gray-200 mx-2"></div>

              {/* Profile section améliorée */}
              <div className="flex items-center">
                <div className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                  {/* Avatar avec indicateur de statut */}
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* Infos utilisateur */}
                  <div className="hidden sm:block min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.nomEcole}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* Bouton logout */}
                <button
                  onClick={handleLogout}
                  className="ml-2 text-gray-500 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-all duration-200 group"
                  title="Se déconnecter"
                >
                  <LogOut
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
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
        <div className="hidden lg:block fixed top-16 right-0 w-80 md:w-[500px] h-full z-40">
          <div className="h-full bg-gray-40/80 backdrop-blur-sm border-l border-gray-200">
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
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Types de contenu
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Cours</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Chapitre</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
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
                    value={order_count}
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
                      Le PDF sera téléchargeable par les étudiants
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
                      La vidéo sera visible en streaming uniquement
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
                            pdf_file: file || null,
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
      {showEditExerciseForm && editingExercise && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Modifier l'exercice {editingExercise.type?.toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Exercice: {editingExercise.nom}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditExerciseForm(false);
                  setEditingExercise(null);
                  setEditExerciseForm({
                    nom: "",
                    description: "",
                    duree_minutes: 30,
                    note_sur: 20,
                    pdf_file: null,
                    questions: [],
                  });
                }}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'exercice *
                    </label>
                    <input
                      type="text"
                      value={editExerciseForm.nom}
                      onChange={(e) =>
                        setEditExerciseForm({
                          ...editExerciseForm,
                          nom: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Exercices chapitre 1, Quiz de révision..."
                    />
                  </div>

                  {editingExercise.type !== "pdf" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée (minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editExerciseForm.duree_minutes}
                        onChange={(e) =>
                          setEditExerciseForm({
                            ...editExerciseForm,
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
                    value={editExerciseForm.description}
                    onChange={(e) =>
                      setEditExerciseForm({
                        ...editExerciseForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                    placeholder="Instructions ou contexte pour les étudiants..."
                  />
                </div>

                {editingExercise.type !== "pdf" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note sur
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editExerciseForm.note_sur}
                      onChange={(e) =>
                        setEditExerciseForm({
                          ...editExerciseForm,
                          note_sur: parseInt(e.target.value) || 20,
                        })
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Contenu spécifique selon le type */}
                {editingExercise.type === "pdf" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fichier PDF de l'exercice
                    </label>

                    {editingExercise.pdf_url && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          PDF actuel:{" "}
                          <span className="font-medium">
                            {editingExercise.pdf_url}
                          </span>
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === "application/pdf") {
                          setEditExerciseForm({
                            ...editExerciseForm,
                            pdf_file: file,
                          });
                        } else if (file) {
                          alert("Veuillez sélectionner un fichier PDF valide");
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                    {editExerciseForm.pdf_file && (
                      <p className="text-sm text-green-600 mt-2">
                        Nouveau fichier sélectionné:{" "}
                        {editExerciseForm.pdf_file.name}
                      </p>
                    )}

                    {!editExerciseForm.pdf_file && (
                      <p className="text-xs text-gray-500 mt-1">
                        Laissez vide pour conserver le PDF actuel
                      </p>
                    )}
                  </div>
                )}

                {editingExercise.type === "qcm" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Questions QCM
                      </h3>
                      <button
                        onClick={() => {
                          const newQuestion = {
                            id: Date.now(),
                            texte: "",
                            ordre: editExerciseForm.questions.length + 1,
                            type: "multiple_choice",
                            multiple_answers: false,
                            options: [
                              {
                                id: Date.now() + 1,
                                texte: "",
                                ordre: 1,
                                is_correct: false,
                              },
                              {
                                id: Date.now() + 2,
                                texte: "",
                                ordre: 2,
                                is_correct: false,
                              },
                            ],
                          };
                          setEditExerciseForm({
                            ...editExerciseForm,
                            questions: [
                              ...editExerciseForm.questions,
                              newQuestion,
                            ],
                          });
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Ajouter une question
                      </button>
                    </div>

                    <div className="space-y-6">
                      {editExerciseForm.questions.map(
                        (question: any, qIdx: number) => (
                          <div
                            key={question.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">
                                Question {qIdx + 1}
                              </h4>
                              <button
                                onClick={() =>
                                  setEditExerciseForm({
                                    ...editExerciseForm,
                                    questions:
                                      editExerciseForm.questions.filter(
                                        (_: string, i: number) => i !== qIdx
                                      ),
                                  })
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="space-y-3">
                              <textarea
                                rows={2}
                                value={question.texte}
                                onChange={(e) => {
                                  const updatedQuestions = [
                                    ...editExerciseForm.questions,
                                  ];
                                  updatedQuestions[qIdx] = {
                                    ...updatedQuestions[qIdx],
                                    texte: e.target.value,
                                  };
                                  setEditExerciseForm({
                                    ...editExerciseForm,
                                    questions: updatedQuestions,
                                  });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                placeholder="Saisissez votre question..."
                              />

                              <div>
                                <label className="flex items-center gap-2 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={question.multiple_answers || false}
                                    onChange={(e) => {
                                      const updatedQuestions = [
                                        ...editExerciseForm.questions,
                                      ];
                                      updatedQuestions[qIdx] = {
                                        ...updatedQuestions[qIdx],
                                        multiple_answers: e.target.checked,
                                      };
                                      setEditExerciseForm({
                                        ...editExerciseForm,
                                        questions: updatedQuestions,
                                      });
                                    }}
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
                                    onClick={() => {
                                      const updatedQuestions = [
                                        ...editExerciseForm.questions,
                                      ];
                                      const newOption = {
                                        id: Date.now(),
                                        texte: "",
                                        ordre: question.options.length + 1,
                                        is_correct: false,
                                      };
                                      updatedQuestions[qIdx] = {
                                        ...updatedQuestions[qIdx],
                                        options: [
                                          ...question.options,
                                          newOption,
                                        ],
                                      };
                                      setEditExerciseForm({
                                        ...editExerciseForm,
                                        questions: updatedQuestions,
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                  >
                                    + Ajouter option
                                  </button>
                                </div>

                                {question.options?.map(
                                  (option: any, oIdx: number) => (
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
                                        name={`edit_question_${qIdx}_correct`}
                                        checked={option.is_correct}
                                        onChange={(e) => {
                                          const updatedQuestions = [
                                            ...editExerciseForm.questions,
                                          ];
                                          if (!question.multiple_answers) {
                                            // Pour radio: décocher toutes les autres options
                                            updatedQuestions[qIdx] = {
                                              ...updatedQuestions[qIdx],
                                              options: question.options.map(
                                                (
                                                  opt: any,
                                                  optIndex: number
                                                ) => ({
                                                  ...opt,
                                                  is_correct:
                                                    optIndex === oIdx
                                                      ? e.target.checked
                                                      : false,
                                                })
                                              ),
                                            };
                                          } else {
                                            // Pour checkbox: modifier seulement cette option
                                            updatedQuestions[qIdx] = {
                                              ...updatedQuestions[qIdx],
                                              options: question.options.map(
                                                (opt: any, optIndex: number) =>
                                                  optIndex === oIdx
                                                    ? {
                                                        ...opt,
                                                        is_correct:
                                                          e.target.checked,
                                                      }
                                                    : opt
                                              ),
                                            };
                                          }
                                          setEditExerciseForm({
                                            ...editExerciseForm,
                                            questions: updatedQuestions,
                                          });
                                        }}
                                        className="rounded"
                                      />
                                      <input
                                        type="text"
                                        value={option.texte}
                                        onChange={(e) => {
                                          const updatedQuestions = [
                                            ...editExerciseForm.questions,
                                          ];
                                          updatedQuestions[qIdx] = {
                                            ...updatedQuestions[qIdx],
                                            options: question.options.map(
                                              (opt: any, optIndex: number) =>
                                                optIndex === oIdx
                                                  ? {
                                                      ...opt,
                                                      texte: e.target.value,
                                                    }
                                                  : opt
                                            ),
                                          };
                                          setEditExerciseForm({
                                            ...editExerciseForm,
                                            questions: updatedQuestions,
                                          });
                                        }}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={`Option ${oIdx + 1}`}
                                      />
                                      {(question.options ?? []).length > 2 && (
                                        <button
                                          onClick={() => {
                                            const updatedQuestions = [
                                              ...editExerciseForm.questions,
                                            ];
                                            updatedQuestions[qIdx] = {
                                              ...updatedQuestions[qIdx],
                                              options: question.options.filter(
                                                (_: any, optIndex: number) =>
                                                  optIndex !== oIdx
                                              ),
                                            };
                                            setEditExerciseForm({
                                              ...editExerciseForm,
                                              questions: updatedQuestions,
                                            });
                                          }}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X size={16} />
                                        </button>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {editingExercise.type === "qro" && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Questions ouvertes
                      </h3>
                      <button
                        onClick={() => {
                          const newQuestion = {
                            id: Date.now(),
                            texte: "",
                            ordre: editExerciseForm.questions.length + 1,
                            type: "open_text",
                            multiple_answers: false,
                            options: [],
                          };
                          setEditExerciseForm({
                            ...editExerciseForm,
                            questions: [
                              ...editExerciseForm.questions,
                              newQuestion,
                            ],
                          });
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Ajouter une question
                      </button>
                    </div>

                    <div className="space-y-4">
                      {editExerciseForm.questions.map(
                        (question: any, qIdx: number) => (
                          <div
                            key={question.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900">
                                Question {qIdx + 1}
                              </h4>
                              <button
                                onClick={() =>
                                  setEditExerciseForm({
                                    ...editExerciseForm,
                                    questions:
                                      editExerciseForm.questions.filter(
                                        (_: string, i: number) => i !== qIdx
                                      ),
                                  })
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <textarea
                              rows={3}
                              value={question.texte}
                              onChange={(e) => {
                                const updatedQuestions = [
                                  ...editExerciseForm.questions,
                                ];
                                updatedQuestions[qIdx] = {
                                  ...updatedQuestions[qIdx],
                                  texte: e.target.value,
                                };
                                setEditExerciseForm({
                                  ...editExerciseForm,
                                  questions: updatedQuestions,
                                });
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-vertical"
                              placeholder="Saisissez votre question ouverte..."
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowEditExerciseForm(false);
                  setEditingExercise(null);
                }}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleUpdateExercise}
                disabled={uploading || !editExerciseForm.nom.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Modification en cours...
                  </>
                ) : (
                  <>
                    <Pencil size={16} />
                    Modifier l'exercice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showStudentForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Ajouter des étudiants
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Importez via Excel ou ajoutez manuellement
                </p>
              </div>
              <button
                onClick={() => setShowStudentForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Onglets de navigation */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setStudentFormTab("excel")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    studentFormTab === "excel"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Import Excel
                </button>
                <button
                  onClick={() => setStudentFormTab("manual")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    studentFormTab === "manual"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Saisie manuelle
                </button>
              </div>

              {/* Partie Import Excel */}
              {studentFormTab === "excel" && (
                <div className="space-y-6">
                  <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="mb-4">
                      <FileSpreadsheet
                        size={48}
                        className="mx-auto text-gray-400"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Importer un fichier Excel
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Téléchargez votre fichier Excel contenant la liste des
                      étudiants
                    </p>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setStudentExcelFile(file);
                        }
                      }}
                      className="hidden"
                      id="excel-upload"
                    />
                    <label
                      htmlFor="excel-upload"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      <Upload size={16} className="mr-2" />
                      Choisir un fichier
                    </label>
                    {studentExcelFile && (
                      <p className="text-sm text-green-600 mt-2">
                        Fichier sélectionné: {studentExcelFile.name}
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <Info
                        size={16}
                        className="text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          Format Excel requis
                        </h4>
                        <p className="text-sm text-blue-700">
                          Colonnes requises : Nom, Prénom, Email, Téléphone,
                          Sexe, Date de naissance. Colonnes optionnelles :
                          Matricule, Nom complet, Adresse, Ville, etc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Partie Saisie manuelle */}
              {studentFormTab === "manual" && (
                <div className="space-y-6">
                  {/* Champs obligatoires */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Informations obligatoires
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={studentForm.nom}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              nom: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: Dupont"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={studentForm.prenom}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              prenom: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: Jean"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Adresse email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={studentForm.email}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="jean.dupont@email.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Numéro de téléphone{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={studentForm.telephone}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              telephone: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="+237 6XX XX XX XX"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sexe <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={studentForm.sexe}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              sexe: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Sélectionner</option>
                          <option value="Masculin">Masculin</option>
                          <option value="Féminin">Féminin</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de naissance{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={studentForm.dateNaissance}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              dateNaissance: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>

                      {/* Matricule ajouté */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Matricule
                        </label>
                        <input
                          type="text"
                          value={studentForm.matricule}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              matricule: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Ex: ETU001"
                        />
                      </div>

                      {/* Nom complet optionnel */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom complet (optionnel)
                        </label>
                        <input
                          type="text"
                          value={studentForm.nomComplet}
                          onChange={(e) =>
                            setStudentForm({
                              ...studentForm,
                              nomComplet: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Remplissage automatique ou personnalisé"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Champs optionnels */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Champs optionnels
                      </h3>
                      <button
                        onClick={() =>
                          setShowOptionalFields(!showOptionalFields)
                        }
                        className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        {showOptionalFields ? (
                          <>
                            <ChevronUp size={16} className="mr-1" />
                            Masquer
                          </>
                        ) : (
                          <>
                            <ChevronDown size={16} className="mr-1" />
                            Afficher les champs optionnels
                          </>
                        )}
                      </button>
                    </div>

                    {showOptionalFields && (
                      <div className="space-y-4">
                        {/* Sélection des champs à activer */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Sélectionnez les champs à ajouter
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              {
                                key: "cni",
                                label: "CNI (fichier)",
                                type: "file",
                              },
                              {
                                key: "diplome",
                                label: "Dernier diplôme (fichier)",
                                type: "file",
                              },
                              {
                                key: "photo",
                                label: "Photo (fichier)",
                                type: "file",
                              },
                              {
                                key: "niveauEtude",
                                label: "Niveau d'étude",
                                type: "select",
                              },
                              {
                                key: "adresse",
                                label: "Adresse",
                                type: "text",
                              },
                              { key: "ville", label: "Ville", type: "text" },
                              { key: "region", label: "Région", type: "text" },
                              {
                                key: "paysOrigine",
                                label: "Pays d'origine",
                                type: "text",
                              },
                              {
                                key: "profession",
                                label: "Profession",
                                type: "text",
                              },
                              {
                                key: "employeur",
                                label: "Employeur",
                                type: "text",
                              },
                              {
                                key: "situationMatrimoniale",
                                label: "Situation matrimoniale",
                                type: "select",
                              },
                              {
                                key: "contactUrgence",
                                label: "Contact d'urgence",
                                type: "tel",
                              },
                              {
                                key: "nomContactUrgence",
                                label: "Nom contact d'urgence",
                                type: "text",
                              },
                              {
                                key: "specialite",
                                label: "Spécialité/Filière",
                                type: "text",
                              },
                              {
                                key: "anneeEtude",
                                label: "Année d'étude",
                                type: "select",
                              },
                            ].map((field) => (
                              <label
                                key={field.key}
                                className="flex items-center space-x-2 text-sm cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedOptionalFields.includes(
                                    field.key
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOptionalFields([
                                        ...selectedOptionalFields,
                                        field.key,
                                      ]);
                                    } else {
                                      setSelectedOptionalFields(
                                        selectedOptionalFields.filter(
                                          (f) => f !== field.key
                                        )
                                      );
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700">
                                  {field.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Champs optionnels activés */}
                        {selectedOptionalFields.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Fichiers */}
                            {selectedOptionalFields.includes("cni") && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CNI (fichier)
                                </label>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setStudentForm({
                                        ...studentForm,
                                        cni: file,
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            )}

                            {selectedOptionalFields.includes("diplome") && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Dernier diplôme (fichier)
                                </label>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setStudentForm({
                                        ...studentForm,
                                        diplome: file,
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            )}

                            {selectedOptionalFields.includes("photo") && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Photo (fichier)
                                </label>
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setStudentForm({
                                        ...studentForm,
                                        photo: file,
                                      });
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            )}

                            {/* Champs texte et sélections */}
                            {selectedOptionalFields.includes("niveauEtude") && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Niveau d'étude
                                </label>
                                <select
                                  value={studentForm.niveauEtude}
                                  onChange={(e) =>
                                    setStudentForm({
                                      ...studentForm,
                                      niveauEtude: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="CEP">CEP</option>
                                  <option value="BEPC">BEPC</option>
                                  <option value="Probatoire">Probatoire</option>
                                  <option value="Baccalauréat">
                                    Baccalauréat
                                  </option>
                                  <option value="BTS/DUT">BTS/DUT</option>
                                  <option value="Licence">Licence</option>
                                  <option value="Master">Master</option>
                                  <option value="Doctorat">Doctorat</option>
                                </select>
                              </div>
                            )}

                            {selectedOptionalFields.includes("anneeEtude") && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Année d'étude
                                </label>
                                <select
                                  value={studentForm.anneeEtude}
                                  onChange={(e) =>
                                    setStudentForm({
                                      ...studentForm,
                                      anneeEtude: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="1ère année">1ère année</option>
                                  <option value="2ème année">2ème année</option>
                                  <option value="3ème année">3ème année</option>
                                  <option value="4ème année">4ème année</option>
                                  <option value="5ème année">5ème année</option>
                                </select>
                              </div>
                            )}

                            {selectedOptionalFields.includes(
                              "situationMatrimoniale"
                            ) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Situation matrimoniale
                                </label>
                                <select
                                  value={studentForm.situationMatrimoniale}
                                  onChange={(e) =>
                                    setStudentForm({
                                      ...studentForm,
                                      situationMatrimoniale: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                  <option value="">Sélectionner</option>
                                  <option value="Célibataire">
                                    Célibataire
                                  </option>
                                  <option value="Marié(e)">Marié(e)</option>
                                  <option value="Divorcé(e)">Divorcé(e)</option>
                                  <option value="Veuf/Veuve">Veuf/Veuve</option>
                                </select>
                              </div>
                            )}

                            {/* Champs texte simples */}
                            {[
                              "adresse",
                              "ville",
                              "region",
                              "paysOrigine",
                              "profession",
                              "employeur",
                              "specialite",
                              "nomContactUrgence",
                            ].map(
                              (field) =>
                                selectedOptionalFields.includes(field) && (
                                  <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      {field === "adresse" && "Adresse"}
                                      {field === "ville" && "Ville"}
                                      {field === "region" && "Région"}
                                      {field === "paysOrigine" &&
                                        "Pays d'origine"}
                                      {field === "profession" && "Profession"}
                                      {field === "employeur" && "Employeur"}
                                      {field === "specialite" &&
                                        "Spécialité/Filière"}
                                      {field === "nomContactUrgence" &&
                                        "Nom contact d'urgence"}
                                    </label>
                                    <input
                                      type="text"
                                      value={getStringValue(
                                        studentForm[
                                          field as keyof typeof studentForm
                                        ]
                                      )}
                                      onChange={(e) =>
                                        setStudentForm({
                                          ...studentForm,
                                          [field]: e.target.value,
                                        })
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                      placeholder={`Ex: ${
                                        field === "adresse"
                                          ? "Quartier Bastos, Yaoundé"
                                          : field === "ville"
                                          ? "Yaoundé"
                                          : field === "region"
                                          ? "Centre"
                                          : field === "paysOrigine"
                                          ? "Cameroun"
                                          : field === "profession"
                                          ? "Développeur"
                                          : field === "employeur"
                                          ? "Entreprise XYZ"
                                          : field === "specialite"
                                          ? "Informatique"
                                          : "Nom du contact"
                                      }`}
                                    />
                                  </div>
                                )
                            )}

                            {selectedOptionalFields.includes(
                              "contactUrgence"
                            ) && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Contact d&apos;urgence
                                </label>
                                <input
                                  type="tel"
                                  value={studentForm.contactUrgence}
                                  onChange={(e) =>
                                    setStudentForm({
                                      ...studentForm,
                                      contactUrgence: e.target.value,
                                    })
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder="+237 6XX XX XX XX"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowStudentForm(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                disabled={uploading}
                onClick={() => {
                  if (studentFormTab === "excel") {
                    handleImportExcel();
                  } else {
                    //handleAddStudent();
                  }
                }}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {studentFormTab === "excel"
                      ? "Import en cours..."
                      : "Ajout en cours..."}
                  </>
                ) : (
                  <>
                    {studentFormTab === "excel"
                      ? "Importer"
                      : "Ajouter l'étudiant"}
                  </>
                )}
              </button>
            </div>
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
