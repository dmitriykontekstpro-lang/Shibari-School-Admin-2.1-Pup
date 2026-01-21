
import React, { useState } from 'react';
import { X, Calendar, MapPin, Ticket, Clock, ArrowRight, MessageCircle, Send, ExternalLink } from 'lucide-react';
import { AppEvent } from '../types';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: AppEvent[];
  lang: 'ru' | 'en';
  t: any;
}

const EventsModal: React.FC<EventsModalProps> = ({ 
    isOpen, onClose, events, lang, t 
}) => {
  const [contactEvent, setContactEvent] = useState<AppEvent | null>(null);

  if (!isOpen) return null;

  // Helper to format date nicely
  const formatDate = (dateString: string) => {
      try {
          const date = new Date(dateString);
          return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
              day: 'numeric',
              month: 'long',
              weekday: 'long'
          });
      } catch (e) { return dateString; }
  };

  const getDay = (dateString: string) => {
      try { return new Date(dateString).getDate(); } catch (e) { return ''; }
  };
  
  const getMonth = (dateString: string) => {
      try { return new Date(dateString).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month: 'short' }).toUpperCase(); } catch (e) { return ''; }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 bg-black shrink-0">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-red-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-red-600" />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">{t.events || "Афиша"}</h2>
                <p className="text-[10px] md:text-xs text-neutral-400">{t.events_subtitle || "Мероприятия и Воркшопы"}</p>
             </div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white/20 text-white hover:border-red-600 hover:bg-red-600 transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 md:p-8 scroll-smooth">
          <div className="max-w-5xl mx-auto pb-20">
              {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                      <Calendar className="w-12 h-12 mb-4 opacity-20" />
                      <p>Нет предстоящих мероприятий.</p>
                  </div>
              ) : (
                  <div className="flex flex-col gap-6">
                      {events.map((event, idx) => (
                          <div key={event.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden group hover:border-red-900/50 transition-all duration-300 shadow-lg flex flex-col md:flex-row min-h-[220px]">
                              
                              {/* Content Section (Left on Desktop) */}
                              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between order-1">
                                  <div>
                                      {/* Header with Date Badge */}
                                      <div className="flex items-start gap-4 mb-4">
                                          <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-center min-w-[60px] shrink-0">
                                              <div className="text-2xl font-bold leading-none text-white">{getDay(event.date)}</div>
                                              <div className="text-[10px] font-bold uppercase tracking-wider text-red-500 mt-1">{getMonth(event.date)}</div>
                                          </div>
                                          <div>
                                              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2 group-hover:text-red-500 transition-colors">{event.title}</h3>
                                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400">
                                                  <div className="flex items-center gap-1.5">
                                                      <Clock className="w-4 h-4 text-neutral-600" />
                                                      <span>{event.time}</span>
                                                  </div>
                                                  <div className="flex items-center gap-1.5">
                                                      <MapPin className="w-4 h-4 text-neutral-600" />
                                                      <span>{event.location}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>

                                      <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3 md:line-clamp-2 mb-6">
                                          {event.description}
                                      </p>
                                  </div>

                                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800 mt-auto">
                                      <div>
                                          <span className="text-[10px] uppercase font-bold text-neutral-600 block mb-0.5">{t.event_price || "Стоимость"}</span>
                                          <span className="text-xl font-mono font-bold text-white">{event.price || "Free"}</span>
                                      </div>
                                      
                                      {event.registration_url && (
                                          <button 
                                              onClick={() => setContactEvent(event)}
                                              className="group/btn flex items-center gap-2 text-white font-bold bg-red-700 hover:bg-red-600 px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-red-900/20"
                                          >
                                              {t.register_event || "Записаться"} 
                                              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                          </button>
                                      )}
                                  </div>
                              </div>

                              {/* Image Section (Right on Desktop, Bottom on Mobile) */}
                              <div className="w-full md:w-80 lg:w-96 h-48 md:h-auto relative overflow-hidden bg-black shrink-0 order-2 border-t md:border-t-0 md:border-l border-neutral-800">
                                  {event.image_url ? (
                                      <>
                                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:bg-gradient-to-r md:from-neutral-900 md:to-transparent opacity-80" />
                                      </>
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-800">
                                          <Calendar className="w-16 h-16" />
                                      </div>
                                  )}
                              </div>

                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* Contact Popup Overlay */}
      {contactEvent && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col">
                  {/* Close Btn */}
                  <button 
                      onClick={() => setContactEvent(null)}
                      className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors bg-black/20 p-1 rounded-full z-10"
                  >
                      <X className="w-5 h-5" />
                  </button>

                  <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-900/30">
                          <Ticket className="w-8 h-8" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                          {contactEvent.title}
                      </h3>
                      <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                          {lang === 'en' 
                            ? "To register for the event, please contact the organizers directly." 
                            : "Чтобы записаться на мероприятие, свяжитесь с организаторами."}
                      </p>

                      <div className="space-y-3">
                          {/* Main Link from DB */}
                          {contactEvent.registration_url && (
                              <a 
                                  href={contactEvent.registration_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-3 w-full bg-white text-black hover:bg-neutral-200 font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-lg"
                              >
                                  <Send className="w-4 h-4" />
                                  {lang === 'en' ? 'Open Registration / Contact' : 'Перейти к регистрации'}
                              </a>
                          )}

                          {/* Generic Contact Fallback (Optional aesthetic addition) */}
                          <a 
                              href="https://t.me/shibarischool" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-3 w-full bg-neutral-800 text-white hover:bg-neutral-700 font-medium py-3.5 rounded-xl transition-all border border-neutral-700"
                          >
                              <MessageCircle className="w-4 h-4 text-blue-400" />
                              {lang === 'en' ? 'Contact Administrator' : 'Написать Администратору'}
                          </a>
                      </div>
                  </div>
                  
                  <div className="bg-black/40 p-4 text-center border-t border-white/5">
                      <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Shibari School Events</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default EventsModal;
