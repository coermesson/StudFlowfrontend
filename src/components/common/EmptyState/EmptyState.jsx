import { useId } from 'react'
import './EmptyState.css'

export default function EmptyState({ illustration, illustrationAlt = '', title, description, action }) {
  const titleId = useId()

  return (
    <section className="empty-state" aria-labelledby={titleId}>
      <img className="empty-state__illustration" src={illustration} alt={illustrationAlt} />
      <div className="empty-state__content">
        <h2 className="empty-state__title" id={titleId}>{title}</h2>
        <p className="empty-state__description">{description}</p>
        {action ? <div className="empty-state__action">{action}</div> : null}
      </div>
    </section>
  )
}
