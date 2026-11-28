// UI rendering module: Renders card, vocab/grammar notes, verbs, and playlist.
export const UIRenderer = {
  elements: {},

  init(domMap) {
    this.elements = domMap;
  },

  renderCard(sentence, isBookmarked, isEsHidden, isKoHidden) {
    if (!sentence) {
      this.elements.spanishText.textContent = '즐겨찾기한 문장이 없습니다.';
      this.elements.koreanText.textContent = '문장 카드의 별표를 눌러 즐겨찾기에 추가해보세요.';
      this.elements.spanishContainer.style.opacity = '1';
      this.elements.koreanContainer.style.opacity = '1';
      this.elements.bookmarkBtn.classList.remove('text-primary');
      this.elements.bookmarkIcon.classList.remove('fill');
      return;
    }

    this.renderInteractiveSpanish(sentence);
    this.elements.koreanText.textContent = sentence.ko;
    this.elements.spanishContainer.style.opacity = isEsHidden ? '0' : '1';
    this.elements.spanishContainer.style.pointerEvents = isEsHidden ? 'none' : 'auto';
    this.elements.koreanContainer.style.opacity = isKoHidden ? '0' : '1';

    if (isBookmarked) {
      this.elements.bookmarkBtn.classList.add('text-primary');
      this.elements.bookmarkIcon.classList.add('fill');
    } else {
      this.elements.bookmarkBtn.classList.remove('text-primary');
      this.elements.bookmarkIcon.classList.remove('fill');
    }
  },

  renderInteractiveSpanish(sentence) {
    const container = this.elements.spanishText;
    container.innerHTML = '';

    const words = sentence.es.split(' ');
    words.forEach((word, idx) => {
      const span = document.createElement('span');
      span.className = 'interactive-word';
      span.textContent = word;
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openWordPopup(word, sentence.vocab || []);
      });
      container.appendChild(span);

      if (idx < words.length - 1) {
        container.appendChild(document.createTextNode(' '));
      }
    });
  },

  openWordPopup(rawWord, vocabList) {
    const modal = document.getElementById('wordPopupModal');
    if (!modal) return;

    const cleanWord = rawWord.replace(/^[¿¡"«'(\[]+/, '').replace(/[?!.,:;)"»\]]+$/, '').toLowerCase();
    
    // Find matching vocab entry
    let matched = null;
    for (const v of vocabList) {
      const vClean = v.word.replace(/^[¿¡"«'(\[]+/, '').replace(/[?!.,:;)"»\]]+$/, '').toLowerCase();
      if (cleanWord === vClean) {
        matched = v;
        break;
      }
      const vTokens = v.word.toLowerCase().split(/\s+/).map((t) => t.replace(/^[¿¡"«'(\[]+/, '').replace(/[?!.,:;)"»\]]+$/, ''));
      if (vTokens.includes(cleanWord)) {
        matched = v;
        break;
      }
    }

    const termElem = document.getElementById('wordPopupTerm');
    const posElem = document.getElementById('wordPopupPos');
    const meaningElem = document.getElementById('wordPopupMeaning');
    const noteSection = document.getElementById('wordPopupNoteSection');
    const noteElem = document.getElementById('wordPopupNote');

    if (matched) {
      termElem.textContent = matched.word;
      posElem.textContent = matched.pos || '단어';
      meaningElem.textContent = matched.meaning;
      if (matched.note && matched.note.trim()) {
        noteElem.textContent = matched.note;
        noteSection.classList.remove('hidden');
      } else {
        noteSection.classList.add('hidden');
      }
    } else {
      termElem.textContent = rawWord.replace(/^[¿¡"«'(\[]+/, '').replace(/[?!.,:;)"»\]]+$/, '');
      posElem.textContent = '단어';
      meaningElem.textContent = '문맥 어휘 카드 및 동사 해설을 참고하세요.';
      noteSection.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  renderPhase(phase, data) {
    const { phaseBadge, phaseIcon, phaseText, countdownTimer, audioTimeLabel, progressFill } = this.elements;
    const totalLabel = data.totalIterations === 0 ? '무제한' : `${data.totalIterations}회`;

    if (phase === 'listening') {
      phaseBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ede5d6] text-[#634b2e] dark:bg-[#3d3126] dark:text-[#deb887] font-semibold shrink-0 border border-[#dfd4c0] dark:border-[#473d35]';
      phaseIcon.textContent = 'volume_up';
      phaseText.textContent = `듣기 (${data.iteration}/${totalLabel})`;
      countdownTimer.textContent = '청취 중';
      audioTimeLabel.textContent = '음성 출력';
      progressFill.style.width = '0%';
      progressFill.className = 'h-full bg-primary rounded-full';
    } else if (phase === 'speaking') {
      phaseBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f3eee5] text-[#85613d] dark:bg-[#332b25] dark:text-[#d4a373] font-semibold shrink-0 border border-[#e6dfd3] dark:border-[#3d342d]';
      phaseIcon.textContent = 'mic';
      phaseText.textContent = `따라 말하기 · `;
      countdownTimer.textContent = `${data.waitDuration.toFixed(1)}s`;
      audioTimeLabel.textContent = `반복 ${data.iteration}/${totalLabel}`;
      progressFill.style.width = '0%';
      progressFill.className = 'h-full bg-primary dark:bg-[#d4a373] rounded-full';
    } else {
      phaseBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium shrink-0';
      phaseIcon.textContent = 'headphones';
      phaseText.textContent = '대기 중';
      countdownTimer.textContent = '';
      audioTimeLabel.textContent = '준비 완료';
      progressFill.style.width = '0%';
    }
  },

  updateProgress(phase, progressRatio, remainingSec) {
    if (phase === 'speaking') {
      this.elements.countdownTimer.textContent = `${remainingSec.toFixed(1)}s`;
    }
    const pct = Math.min(100, Math.max(0, progressRatio * 100));
    this.elements.progressFill.style.width = `${pct}%`;
  },

  renderVocab(vocabList = []) {
    const container = this.elements.vocabContainer;
    container.innerHTML = '';

    if (!vocabList || vocabList.length === 0) {
      container.innerHTML = '<div class="col-span-2 py-4 text-center text-xs text-on-surface-muted">단어 정보가 없습니다.</div>';
      return;
    }

    for (const item of vocabList) {
      const tile = document.createElement('div');
      tile.className = 'p-2.5 rounded-xl bg-white dark:bg-[#2b241f] border border-[#ebe5db] dark:border-[#3d342d] shadow-sm flex flex-col justify-center gap-1';

      const hasNote = Boolean(item.note && item.note.trim());

      tile.innerHTML = `
        <div class="flex items-start justify-between gap-1.5">
          <span class="font-bold text-[#1e1b18] dark:text-[#f5eee6] text-[13px] leading-snug break-words flex-1">${item.word}</span>
          <span class="text-[10px] text-[#85613d] dark:text-[#d4a373] font-semibold bg-[#f8f5ee] dark:bg-[#332b25] px-1.5 py-0.5 rounded border border-[#ebe5db] dark:border-[#473d35] shrink-0 mt-0.5">${item.pos}</span>
        </div>
        <span class="text-[11px] text-[#554b42] dark:text-[#c3b7ab] font-medium leading-snug break-words">${item.meaning}</span>
        ${hasNote ? `<div class="mt-0.5 text-[10px] text-[#7d736a] dark:text-[#9c8e80] bg-[#faf7f2] dark:bg-[#231e1a] px-1.5 py-0.5 rounded leading-normal border border-[#ebe5db] dark:border-[#3d342d] break-words"><span class="font-semibold text-primary">메모:</span> ${item.note}</div>` : ''}
      `;
      container.appendChild(tile);
    }
  },

  renderVerbs(verbsList = []) {
    const container = this.elements.verbsContainer;
    container.innerHTML = '';

    if (!verbsList || verbsList.length === 0) {
      this.elements.verbsSection.classList.add('hidden');
      return;
    }
    this.elements.verbsSection.classList.remove('hidden');

    const personKeys = [
      { key: 'yo', label: 'yo' },
      { key: 'tu', label: 'tú' },
      { key: 'el', label: 'él / ella / Ud.' },
      { key: 'nosotros', label: 'nosotros/as' },
      { key: 'vosotros', label: 'vosotros/as' },
      { key: 'ellos', label: 'ellos / ellas / Uds.' }
    ];

    for (const vb of verbsList) {
      const card = document.createElement('div');
      card.className = 'bg-[#faf7f2] dark:bg-[#231e1a] rounded-xl p-3 space-y-2.5 border border-[#ebe5db] dark:border-[#3d342d] shadow-sm';

      let gridHtml = '';
      for (const p of personKeys) {
        const form = (vb.conjugation && vb.conjugation[p.key]) || '-';
        const formMatches = Boolean(vb.usedForm && form.toLowerCase().trim() === vb.usedForm.toLowerCase().trim());
        const isUsed = vb.person ? (vb.person === p.key && formMatches) : formMatches;

        if (isUsed) {
          gridHtml += `
            <div class="p-2.5 rounded-lg bg-primary text-on-primary flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div class="flex items-center justify-between">
                <span class="text-[11px] text-white/90 font-medium">${p.label}</span>
                <span class="inline-flex items-center gap-0.5 text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-bold">★ 문장 사용</span>
              </div>
              <span class="text-[14px] font-bold mt-1 text-white tracking-wide">${form}</span>
            </div>
          `;
        } else {
          gridHtml += `
            <div class="p-2.5 rounded-lg bg-white dark:bg-[#2b241f] text-on-surface flex flex-col justify-between border border-[#ebe5db] dark:border-[#3d342d] shadow-sm">
              <span class="text-[11px] text-on-surface-muted font-medium">${p.label}</span>
              <span class="text-[13px] font-bold mt-1 text-[#29221c] dark:text-[#f5eee6]">${form}</span>
            </div>
          `;
        }
      }

      card.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-1.5 pb-1 border-b border-[#ebe5db] dark:border-[#3d342d]">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="material-symbols-outlined text-primary text-[16px]">menu_book</span>
            <span class="font-bold text-[14px] text-on-surface">${vb.infinitive}</span>
            <span class="px-1.5 py-0.5 rounded bg-white dark:bg-[#2b241f] text-primary text-[11px] font-semibold border border-[#ebe5db] dark:border-[#3d342d]">동사</span>
            <span class="text-on-surface-variant text-[12px]">· ${vb.meaning}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full bg-white dark:bg-[#2b241f] text-secondary font-medium text-[11px] border border-[#ebe5db] dark:border-[#3d342d]">${vb.tense}</span>
        </div>
        <div class="grid grid-cols-2 gap-2">${gridHtml}</div>
      `;
      container.appendChild(card);
    }
  },

  renderPlaylist(sentences, activeId, completedIds, bookmarks, onItemClick) {
    const container = this.elements.playlistContainer;
    container.innerHTML = '';

    if (!sentences || sentences.length === 0) {
      container.innerHTML = '<div class="py-8 text-center text-on-surface-muted text-[13px] font-medium">즐겨찾기한 문장이 없습니다.</div>';
      return;
    }

    for (const item of sentences) {
      const isCurrent = item.id === activeId;
      const isDone = completedIds.includes(item.id);
      const isStarred = bookmarks.includes(item.id);

      const el = document.createElement('div');
      el.className = `sentence-item p-2.5 rounded-xl flex items-center justify-between hover:bg-[#faf7f2] dark:hover:bg-[#332b25] transition-colors cursor-pointer border shadow-sm ${
        isCurrent
          ? 'bg-[#faf7f2] dark:bg-[#332b25] border-2 border-primary'
          : 'bg-white dark:bg-[#2b241f] border-[#ebe5db] dark:border-[#3d342d]'
      }`;

      el.innerHTML = `
        <div class="min-w-0 pr-2 flex-1">
          <div class="flex items-center gap-1.5">
            <span class="font-label-sm text-label-sm ${isCurrent ? 'text-primary font-bold' : 'text-[#85613d] dark:text-[#d4a373] font-semibold'} whitespace-nowrap shrink-0">#${item.number.toString().padStart(2, '0')} · ${item.level}</span>
            <span class="font-label-md text-label-md text-on-surface font-bold truncate">${item.es}</span>
          </div>
          <p class="font-body-sm text-[12px] text-on-surface-variant truncate">${item.ko}</p>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          ${isStarred ? '<span class="material-symbols-outlined text-[16px] text-primary fill">star</span>' : ''}
          ${
            isCurrent
              ? '<span class="px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[11px] font-bold flex items-center gap-0.5"><span class="material-symbols-outlined text-[12px] animate-pulse">volume_up</span><span>재생중</span></span>'
              : isDone
              ? '<span class="px-2 py-0.5 rounded-full bg-surface-container text-[#85613d] dark:text-[#d4a373] font-label-sm text-[11px] font-semibold border border-border-light">완료</span>'
              : '<span class="material-symbols-outlined text-[#85613d] dark:text-[#d4a373] text-[20px]">play_circle</span>'
          }
        </div>
      `;

      el.addEventListener('click', () => onItemClick(item.id));
      container.appendChild(el);
    }
  },

  renderScopeProgress(doneCount, totalCount) {
    this.elements.scopeProgressText.textContent = `${doneCount}/${totalCount}`;
    const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
    this.elements.scopeProgressBar.style.width = `${pct}%`;
  }
};
