const MAX_VISIBLE_LINES = 18;

export class Terminal {
  constructor({ linesElement, stateElement }) {
    this.linesElement = linesElement;
    this.stateElement = stateElement;
  }

  reset() {
    this.linesElement.replaceChildren();
    this.setState('AWAITING INPUT');
  }

  setState(label) {
    this.stateElement.textContent = label;
  }

  append(channel) {
    for (const line of channel.lines ?? []) {
      const element = document.createElement('div');
      const content = typeof line === 'string' ? { text: line, kind: 'command' } : line;
      element.className = `terminal-line terminal-line-${content.kind ?? 'command'}`;
      element.textContent = content.text;
      this.linesElement.append(element);
    }

    while (this.linesElement.children.length > MAX_VISIBLE_LINES) {
      this.linesElement.firstElementChild?.remove();
    }

    this.setState(channel.state ?? this.stateElement.textContent);
    this.linesElement.scrollTop = this.linesElement.scrollHeight;
  }
}
