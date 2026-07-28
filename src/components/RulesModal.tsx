import { X, Award, ShieldAlert, Swords, Clock, CheckCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-3xl glass-panel rounded-2xl border border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black border border-orange-500/40 p-1 flex items-center justify-center">
              <img src="/logo-maylson.png" alt="Maylson Campos Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Regulamento Oficial da Liga de Badminton</h3>
              <p className="text-xs text-slate-400">Complexo Esportivo Maylson Campos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Formato da Disputa */}
          <section className="space-y-2">
            <h4 className="text-orange-400 font-bold text-base flex items-center gap-2">
              <Swords className="w-4 h-4" /> Formato da Disputa
            </h4>
            <p className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
              O campeonato é disputado na categoria aberta, independente de idade ou nível técnico dos atletas. É possível ser promovido de nível dentro da liga desafiando jogadores do seu próprio nível ou de níveis superiores.
            </p>
          </section>

          {/* Estrutura da Liga e Desafios */}
          <section className="space-y-3">
            <h4 className="text-orange-400 font-bold text-base flex items-center gap-2">
              <Clock className="w-4 h-4" /> Estrutura da Liga e Desafios Semanais
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Frequência:</strong> Cada atleta tem o direito de realizar <strong>1 desafio por semana</strong> como desafiante.
                </span>
              </li>
              <li className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Vitória contra Nível Superior:</strong> O desafiante <strong>assume a posição do adversário</strong> na pirâmide, promovendo a troca de posições entre eles.
                </span>
              </li>
              <li className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Vitória no Mesmo Nível:</strong> O desafiante <strong>sobe 1 nível/posição</strong>.
                </span>
              </li>
              <li className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Derrota para Nível Superior:</strong> O desafiante ficará <strong>2 semanas suspenso</strong> sem realizar novos desafios.
                </span>
              </li>
              <li className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Derrota no Mesmo Nível:</strong> Permanece na mesma posição e pode desafiar normalmente na semana seguinte.
                </span>
              </li>
            </ul>
          </section>

          {/* Regras de Recusa e W.O. */}
          <section className="space-y-3">
            <h4 className="text-amber-400 font-bold text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Regras de W.O. e Recusa
            </h4>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <p>
                • <strong>W.O. do Desafiado:</strong> Caso não possa comparecer, deve desmarcar com no mínimo 1 hora de antecedência. Sem esse aviso, será caracterizado W.O., promovendo o desafiante.
              </p>
              <p>
                • <strong>W.O. do Desafiante:</strong> O desafiante que faltar terá punição de <strong>2 semanas de suspensão</strong> para realizar novos desafios.
              </p>
              <p>
                • <strong>Recusa Repetida:</strong> Qualquer atleta pode recusar um confronto se já realizou algum na mesma semana. Porém, recusa repetida contra o mesmo adversário sem justificativa válida (falta justificada ou incompatibilidade comprovada) resultará em W.O. automático.
              </p>
            </div>
          </section>

          {/* Premiação a Cada 3 Meses */}
          <section className="space-y-2">
            <h4 className="text-amber-400 font-bold text-base flex items-center gap-2">
              <Award className="w-4 h-4" /> Premiação a Cada 3 Meses
            </h4>
            <p className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
              A cada 3 meses a liga encerra o ciclo. Na confraternização final, os atletas dos <strong>3 primeiros níveis da pirâmide</strong> serão premiados com brindes, isenção ou descontos em mensalidades ou na confraternização.
            </p>
          </section>
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs shadow-md transition-colors"
          >
            Entendi as Regras
          </button>
        </div>
      </div>
    </div>
  );
};
