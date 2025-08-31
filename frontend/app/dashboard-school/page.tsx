"use client";

import { supabase, type Filieres } from "@/app/lib/supabaseConfig";
import ConfirmDialog from "../components/ui/dialog";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
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
  Settings,
  Filter,
} from "lucide-react";

type EmptyStateKey =
  | "mes-modules"
  | "mes-cours"
  | "mes-chapitres"
  | "mes-exercices"
  | "filieres"
  | "etudiants"
  | "notifications";

interface EmptyState {
  title: string;
  description: string;
  cta: string;
  image: string;
}

interface User {
  id: string;
  nom: string;
  fonction: string;
  nomEcole: string;
  email: string;
  telephone: string;
  status: string;
}

interface Module {
  id: string;
  nom: string;
  description: string;
  filières: string[];
  dateCreation: string;
  nombreCours: number;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: "cours" | "chapitre" | "exercice";
  date: string;
  time: string;
  description: string;
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<EmptyStateKey>("mes-modules");
  const [activeMainTab, setActiveMainTab] = useState<string>("cours-modules");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [moduleForm, setModuleForm] = useState({
    nom: "",
    description: "",
    filières: [] as string[],
  });

  // Liste des filières disponibles dans une école de formation
  const filièresDisponibles = [
    "Informatique",
    "Génie Civil",
    "Électrotechnique",
    "Mécanique Générale",
    "Commerce International",
    "Comptabilité Gestion",
    "Marketing Digital",
    "Ressources Humaines",
    "Architecture",
    "Télécommunications",
    "Énergies Renouvelables",
    "Agriculture",
    "Médecine",
    "Pharmacie",
    "Droit",
    "Économie",
    "Management",
    "Communication",
    "Tourisme Hôtellerie",
    "Arts et Design",
  ];
  const [filieres, setFilieres] = useState<Filieres[]>([]);
  const [loadingFilieres, setLoadingFilieres] = useState(false);
  const [showFiliereForm, setShowFiliereForm] = useState(false);
  const [filiereForm, setFiliereForm] = useState({ nom: "", description: " " });
  const [showEditFiliereForm, setShowEditFiliereForm] = useState(false);
  const [editingFiliere, setEditingFiliere] = useState<Filieres | null>(null);
  const [editFiliereForm, setEditFiliereForm] = useState({
    nom: "",
    description: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filiereToDelete, setFiliereToDelete] = useState<Filieres | null>(null);

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

  //useEffect(() => {
  //if (user) {
  //loadFilieres();
  //}
  //}, [user]);

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

  // Gestion du formulaire de module
  const handleCreateModule = () => {
    if (!moduleForm.nom.trim() || !moduleForm.description.trim()) {
      alert("Veuillez remplir le nom et la description du module");
      return;
    }

    if (moduleForm.filières.length === 0) {
      alert("Veuillez sélectionner au moins une filière");
      return;
    }

    const newModule: Module = {
      id: Date.now().toString(),
      nom: moduleForm.nom.trim(),
      description: moduleForm.description.trim(),
      filières: [...moduleForm.filières],
      dateCreation: new Date().toLocaleDateString("fr-FR"),
      nombreCours: 0,
    };

    setModules([...modules, newModule]);
    setModuleForm({ nom: "", description: "", filières: [] });
    setShowModuleForm(false);
  };

  // Supprimer un module
  const handleDeleteModule = (moduleId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) {
      setModules(modules.filter((module) => module.id !== moduleId));
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
          filières: module.filières.filter((f) => f !== filiereToDelete.nom),
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
      if (data.nom !== editingFiliere.nom) {
        setModules(
          modules.map((module) => ({
            ...module,
            filières: module.filières.map((f) =>
              f === editingFiliere.nom ? data.nom : f
            ),
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

  // Fonctions du calendrier
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
          className={`h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 ${
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
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 capitalize">
            {monthYear}
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => navigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => navigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
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

  if (!user) {
    return null;
  }

  const mainTabs = [
    {
      id: "cours-modules",
      name: "Cours et Modules",
      icon: BookOpen,
      subTabs: [
        { id: "filieres", name: "Mes filières", icon: Filter },
        { id: "mes-modules", name: "Mes modules", icon: BookMarked },
        { id: "mes-cours", name: "Mes cours", icon: GraduationCap },
        { id: "mes-chapitres", name: "Mes chapitres", icon: FileText },
        { id: "mes-exercices", name: "Mes exercices", icon: PenTool },
      ],
    },
    {
      id: "etudiants",
      name: "Nos étudiants",
      icon: Users,
    },
    {
      id: "notifications",
      name: "Nos notifications",
      icon: Bell,
    },
  ];

  const emptyStates: Record<EmptyStateKey, EmptyState> = {
    filieres: {
      title: "Gestion des filières",
      description:
        "Organisez et gérez les différentes filières de votre établissement. Associez des modules et cours à chaque filière.",
      cta: "Configurer les filières",
      image: "🎯",
    },
    "mes-modules": {
      title: "Aucun module créé",
      description:
        "Un module est un ensemble thématique qui regroupe plusieurs cours. Créez votre premier module pour organiser vos contenus par filières.",
      cta: "Créer un module",
      image: "📚",
    },
    "mes-cours": {
      title: "Aucun cours créé",
      description:
        "Les cours sont les matières spécifiques contenues dans vos modules. Créez des cours pour chaque module.",
      cta: "Créer un cours",
      image: "🎓",
    },
    "mes-chapitres": {
      title: "Aucun chapitre disponible",
      description:
        "Divisez vos cours en chapitres pour structurer l'apprentissage progressif de vos étudiants.",
      cta: "Ajouter un chapitre",
      image: "📖",
    },
    "mes-exercices": {
      title: "Aucun exercice créé",
      description:
        "Créez des exercices pratiques pour évaluer la compréhension dans vos cours.",
      cta: "Créer un exercice",
      image: "✏️",
    },
    etudiants: {
      title: "Aucun étudiant inscrit",
      description:
        "Invitez vos premiers étudiants à rejoindre vos modules de formation par filières.",
      cta: "Inviter des étudiants",
      image: "👥",
    },
    notifications: {
      title: "Aucune notification",
      description:
        "Vous recevrez ici toutes les notifications importantes de votre plateforme.",
      cta: "Configurer les notifications",
      image: "🔔",
    },
  };

  const getCurrentEmptyState = (): EmptyState => {
    if (activeMainTab === "cours-modules") {
      return emptyStates[activeTab];
    }
    return emptyStates[activeMainTab as EmptyStateKey];
  };

  const renderFilieresContent = () => {
    return (
      <div>
        {/* Si aucune filière, afficher l'état vide */}
        {filieres.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Aucune filière créée
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
              Créez vos premières filières pour organiser vos modules et cours
              par spécialité. Chaque filière peut contenir plusieurs modules.
            </p>
            <button
              onClick={() => setShowFiliereForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              Créer une filière
            </button>
          </div>
        ) : (
          /* Si des filières existent, les afficher */
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Gestion des Filières
              </h1>
              <p className="text-gray-600">
                Organisez vos filières et visualisez les modules associés
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
              {filieres.map((filiere) => {
                const modulesAssocie = modules.filter((module) =>
                  module.filières.includes(filiere.nom)
                ).length;

                return (
                  <div
                    key={filiere.id}
                    className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {filiere.nom.charAt(0).toUpperCase()}
                      </div>
                      <button
                        onClick={() => handleDeleteFiliere(filiere.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:cursor-pointer"
                        title="Supprimer la filière"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                      {filiere.nom}
                    </h3>

                    {filiere.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {filiere.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookMarked size={12} />
                        <span>{modulesAssocie} module(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={12} />
                        <span>0 étudiant(s)</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        className="w-full bg-blue-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded text-xs font-medium transition-colors cursor-pointer"
                        onClick={() => handleEditFiliere(filiere)}
                      >
                        Modifier la filière
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowFiliereForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Plus size={18} />
              Créer une nouvelle filière
            </button>
          </div>
        )}

        {/* 🎯 MODAL DÉPLACÉ ICI - Toujours disponible */}
        {showFiliereForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
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

        {/* Modal de modification */}
        {showEditFiliereForm && editingFiliere && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
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
      </div>
    );
  };

  const renderContent = () => {
    // Contenu spécifique pour les filières
    if (activeTab === "filieres") {
      return renderFilieresContent();
    }

    // Si on est sur mes-modules et qu'il y a des modules, les afficher
    if (activeTab === "mes-modules" && modules.length > 0) {
      return (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Mes Modules
            </h1>
            <p className="text-gray-600">
              Gérez vos modules thématiques et leurs cours associés
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                    {module.nom}
                  </h3>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 ml-2"
                    title="Supprimer le module"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {module.description}
                </p>

                {/* Filières */}
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">
                    Filières concernées:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {module.filières.slice(0, 2).map((filière) => (
                      <span
                        key={filière}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      >
                        {filière}
                      </span>
                    ))}
                    {module.filières.length > 2 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                        +{module.filières.length - 2} autres
                      </span>
                    )}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {module.nombreCours} cours
                  </span>
                  <span>Créé le {module.dateCreation}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded text-sm font-medium transition-colors">
                    Voir les cours
                  </button>
                  <button className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded text-sm font-medium transition-colors">
                    + Cours
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowModuleForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={18} />
            Créer un nouveau module
          </button>
        </div>
      );
    }

    // Sinon, afficher l'état vide
    const currentState = getCurrentEmptyState();
    const handleCTAClick = () => {
      if (activeTab === "mes-modules") {
        setShowModuleForm(true);
      } else {
        console.log(`Action: ${currentState.cta}`);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="text-6xl mb-6">{currentState.image}</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          {currentState.title}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          {currentState.description}
        </p>
        <button
          onClick={handleCTAClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <Plus size={18} />
          {currentState.cta}
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header Sidebar - Fixed */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xl">
              E
            </div>
            <span className="ml-2 font-semibold text-gray-900 hidden sm:block text-xl truncate">
              EduPlatform
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-6 overflow-y-auto h-[calc(100vh-6rem)]">
          {mainTabs.map((tab) => (
            <div key={tab.id}>
              <button
                onClick={() => {
                  setActiveMainTab(tab.id);
                  if (tab.subTabs) {
                    setActiveTab(tab.subTabs[0].id as EmptyStateKey);
                  } else {
                    setActiveTab(tab.id as EmptyStateKey);
                  }
                }}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  activeMainTab === tab.id
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700"
                }`}
              >
                <tab.icon size={20} className="mr-3" />
                {tab.name}
              </button>

              {tab.subTabs && activeMainTab === tab.id && (
                <div className="bg-gray-50">
                  {tab.subTabs.map((subTab) => (
                    <button
                      key={subTab.id}
                      onClick={() => setActiveTab(subTab.id as EmptyStateKey)}
                      className={`w-full flex items-center px-12 py-2 text-left text-sm hover:bg-gray-100 transition-colors duration-150 ${
                        activeTab === subTab.id
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      <subTab.icon size={16} className="mr-3" />
                      {subTab.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Navbar - Fixed */}
        <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-0 lg:left-64 z-30">
          <div className="flex items-center justify-between h-full px-3 sm:px-6">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-2 p-1 rounded"
              >
                <Menu size={20} />
              </button>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-3 min-w-0">
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-4 pr-10 py-2 w-48 lg:w-64 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 text-sm"
                />
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden text-gray-500 hover:text-gray-700 p-2 rounded"
              >
                <Search size={18} />
              </button>

              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 p-2 flex items-center gap-1 cursor-pointer"
                title="Calendrier de programmation"
              >
                <Calendar size={18} />
                <span className="hidden xl:inline text-sm">
                  Programmer un évènement
                </span>
              </button>

              {/* Profile */}
              <div className="flex items-center min-w-0">
                <button
                  onClick={handleAccountSettings}
                  className="flex items-center space-x-2 hover:bg-gray-50 px-2 py-2 rounded-lg transition-colors duration-200 min-w-0"
                >
                  <div className="w-8 h-8 bg-gradient-to-br bg-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block min-w-0 max-w-32">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {user.nomEcole}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {user.email}
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200 p-2 flex items-center cursor-pointer"
                title="Déconnexion"
              >
                <LogOut size={18} />
                <span className="hidden xl:inline ml-1 text-sm">
                  Déconnexion
                </span>
              </button>
            </div>
          </div>
          {searchOpen && (
            <div className="md:hidden border-t border-gray-200 p-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                  autoFocus
                />
                <Search
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area - Scrollable */}
        <main className="flex-1 mt-16 overflow-auto">
          <div className="flex h-full">
            {/* Content Principal - Scrollable */}
            <div
              className={`flex-1 p-3 sm:p-6 overflow-y-auto ${
                showCalendar ? "lg:w-2/3" : ""
              }`}
            >
              {renderContent()}
            </div>

            {/* Calendrier Sticky - Non scrollable */}
            {showCalendar && (
              <div className="hidden lg:block w-80 xl:w-96 border-l border-gray-200 bg-gray-50">
                <div className="sticky top-0 max-h-screen overflow-y-auto p-6">
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
                  <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
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
            )}
          </div>
        </main>
      </div>

      {/* Modal Calendrier Mobile */}
      {showCalendar && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
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

      {/* Modal Formulaire de Module */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 m-0">
                  Créer un nouveau module
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Un module regroupe plusieurs cours par thématique
                </p>
              </div>
              <button
                onClick={() => setShowModuleForm(false)}
                className="text-gray-400 hover:text-gray-600 p-1 border-none bg-transparent cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu Modal */}
            <div className="p-6 space-y-6">
              {/* Nom du module */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du module *
                </label>
                <input
                  type="text"
                  value={moduleForm.nom}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, nom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ex: Développement Web Avancé, Gestion de Projet, Mathématiques Appliquées..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description du module *
                </label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm({
                      ...moduleForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-all"
                  placeholder="Décrivez les objectifs et le contenu général de ce module. Ce module contiendra plusieurs cours spécialisés..."
                />
              </div>

              {/* Sélection des filières */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filières concernées * (Sélectionnez une ou plusieurs filières)
                </label>

                {/* Container des checkboxes */}
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filièresDisponibles.map((filière) => (
                      <label
                        key={filière}
                        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={moduleForm.filières.includes(filière)}
                          onChange={() => handleFilièreToggle(filière)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{filière}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Affichage des filières sélectionnées */}
                {moduleForm.filières.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">
                      Filières sélectionnées ({moduleForm.filières.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {moduleForm.filières.map((filière) => (
                        <span
                          key={filière}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"
                        >
                          {filière}
                          <button
                            onClick={() => handleFilièreToggle(filière)}
                            className="hover:text-blue-600 bg-transparent border-none cursor-pointer p-0 inline-flex items-center"
                            type="button"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModuleForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateModule}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  type="button"
                >
                  Créer le module
                </button>
              </div>
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