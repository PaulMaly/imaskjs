export default
class PatternGroup {
  constructor(masked, {name, offset, mask, validate}) {
    this.masked = masked;
    this.name = name;
    this.offset = offset;
    this.mask = mask;
    this.validate = validate || (() => true);
  }

  get value () {
    return this.masked.value.slice(
      this.masked.mapDefIndexToPos(this.offset),
      this.masked.mapDefIndexToPos(this.offset + this.mask.length));
  }

  get unmaskedValue () {
    return this.masked.extractInput(
      this.masked.mapDefIndexToPos(this.offset),
      this.masked.mapDefIndexToPos(this.offset + this.mask.length));
  }

  _validate (soft) {
    return this.validate(this.value, this, soft);
  }
}

export class Range {
  constructor ([from, to], maxlen=(to+'').length) {
    this._from = from;
    this._to = to;
    this._maxLength = maxlen;
    this.validate = this.validate.bind(this);

    this._update();
  }

  get to () {
    return this._to;
  }

  set to (to) {
    this._to = to;
    this._update();
  }

  get from () {
    return this._from;
  }

  set from (from) {
    this._from = from;
    this._update();
  }

  get maxLength () {
    return this._maxLength;
  }

  set maxLength (maxLength) {
    this._maxLength = maxLength;
    this._update();
  }

  get _matchFrom () {
    return this.maxLength - (this.from + '').length;
  }

  _update() {
    this._maxLength = Math.max(this._maxLength, (this.from + '').length);
    this.mask = '0'.repeat(this._maxLength);

  }

  validate (str) {
    let minstr = '';
    let maxstr = '';

    const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/);
    if (num) {
      minstr = ('0'.repeat(placeholder.length) + num);
      maxstr = ('9'.repeat(placeholder.length) + num);
    }

    const firstNonZero = str.search(/[^0]/);
    if (firstNonZero === -1 && str.length <= this._matchFrom) return true;

    minstr = minstr.padEnd(this._maxLength, '0');
    maxstr = maxstr.padEnd(this._maxLength, '9');

    return this.from <= Number(maxstr) && Number(minstr) <= this.to;
  }
}

PatternGroup.Range = Range;
